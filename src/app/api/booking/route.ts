import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSlot, upcomingDates } from "@/lib/booking";
import {
  adminBookingEmail,
  clientBookingConfirmationEmail,
  type BookingRecord,
} from "@/lib/email/booking-emails";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOOKAHEAD_DAYS = 60;

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
  } else {
    console.warn("[api/booking] RESEND_API_KEY not set — skipping email delivery.");
  }

  return NextResponse.json({ ok: true, id: bookingId }, { status: 201 });
}
