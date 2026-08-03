import { NextResponse, after } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSlot, upcomingDates } from "@/lib/booking";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  adminBookingEmail,
  clientBookingConfirmationEmail,
  type BookingRecord,
} from "@/lib/email/booking-emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOOKAHEAD_DAYS = 60;

const MAX_NAME_LEN = 200;
const MAX_EMAIL_LEN = 320;
const MAX_PHONE_LEN = 40;
const MAX_NOTES_LEN = 4000;

const GET_LIMIT = 60; // reads per window — availability lookups are cheap but public
const GET_WINDOW_MS = 60_000;
const POST_LIMIT = 5; // writes + emails per window — the expensive path
const POST_WINDOW_MS = 10 * 60_000;

function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Which slots are already booked, for the next `days` days. Only ever
 * returns times — never contact_name/email/phone — since this endpoint
 * has no auth and is called by anonymous visitors. */
export async function GET(request: Request) {
  if (!configured()) {
    return NextResponse.json({ error: "Booking isn't configured yet." }, { status: 503 });
  }

  if (!rateLimit(`booking:get:${getClientIp(request)}`, GET_LIMIT, GET_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests — please slow down." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "14", 10) || 14, 1), MAX_LOOKAHEAD_DAYS);
  const dates = upcomingDates(days);

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("event_date, event_time")
      .not("event_time", "is", null)
      .gte("event_date", dates[0])
      .lte("event_date", dates[dates.length - 1]);

    if (error) throw error;

    const taken: Record<string, string[]> = {};
    for (const row of data || []) {
      (taken[row.event_date] ||= []).push(row.event_time);
    }

    return NextResponse.json({ taken });
  } catch (error) {
    console.error("[api/booking] Failed to load availability:", error);
    return NextResponse.json({ error: "Couldn't load availability." }, { status: 500 });
  }
}

type BookingPayload = {
  date?: unknown;
  time?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  notes?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!configured()) {
    return NextResponse.json(
      { error: "Booking isn't fully configured yet. Please email us directly for now." },
      { status: 503 }
    );
  }

  if (!rateLimit(`booking:post:${getClientIp(request)}`, POST_LIMIT, POST_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests — please try again later." }, { status: 429 });
  }

  let payload: BookingPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "That request wasn't formatted correctly." }, { status: 400 });
  }

  const date = str(payload.date);
  const time = str(payload.time);
  const name = str(payload.name);
  const email = str(payload.email);
  const phone = str(payload.phone) || null;
  const notes = str(payload.notes) || null;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }
  if (
    name.length > MAX_NAME_LEN ||
    email.length > MAX_EMAIL_LEN ||
    (phone && phone.length > MAX_PHONE_LEN) ||
    (notes && notes.length > MAX_NOTES_LEN)
  ) {
    return NextResponse.json({ error: "One of those fields is too long." }, { status: 400 });
  }
  if (!isValidSlot(date, time)) {
    return NextResponse.json(
      { error: "That time isn't available — pick another slot." },
      { status: 400 }
    );
  }

  const record: BookingRecord = {
    event_date: date,
    event_time: time,
    contact_name: name,
    contact_email: email,
    contact_phone: phone,
    notes,
  };

  let bookingId: string;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        event_date: date,
        event_time: time,
        title: `Call with ${name}`,
        type: "Meeting",
        source: "booking",
        contact_name: name,
        contact_email: email,
        contact_phone: phone,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "That slot was just taken — pick another time." },
          { status: 409 }
        );
      }
      throw error;
    }
    bookingId = data.id;
  } catch (error) {
    console.error("[api/booking] Failed to save booking:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your booking. Please try again." },
      { status: 500 }
    );
  }

  if (process.env.RESEND_API_KEY) {
    // Send after the response goes out — the booking is already saved, so
    // the visitor shouldn't wait on two Resend round trips to see success.
    after(async () => {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.ADMIN_FROM_EMAIL || "onboarding@resend.dev";
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

        const notifications: Promise<unknown>[] = [];

        if (adminEmail) {
          const admin = adminBookingEmail(record);
          notifications.push(
            resend.emails.send({
              from: fromAddress,
              to: adminEmail,
              subject: admin.subject,
              html: admin.html,
              replyTo: email,
            })
          );
        }

        const client = clientBookingConfirmationEmail(record);
        notifications.push(
          resend.emails.send({ from: fromAddress, to: email, subject: client.subject, html: client.html })
        );

        await Promise.allSettled(notifications);
      } catch (error) {
        console.error("[api/booking] Email delivery failed:", error);
      }
    });
  } else {
    console.warn("[api/booking] RESEND_API_KEY not set — skipping email delivery.");
  }

  return NextResponse.json({ ok: true, id: bookingId }, { status: 201 });
}
