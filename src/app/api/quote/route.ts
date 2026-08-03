import { NextResponse, after } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  adminNotificationEmail,
  clientConfirmationEmail,
  type QuoteRecord,
} from "@/lib/email/quote-emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_SHORT_LEN = 200; // name, business, industry, phone, package/timeline labels
const MAX_URL_LEN = 500;
const MAX_LONG_LEN = 4000; // free-text message
const MAX_FEATURES = 20;
const MAX_FEATURE_LEN = 100;

const POST_LIMIT = 5; // writes + emails per window
const POST_WINDOW_MS = 10 * 60_000;

type QuotePayload = {
  name?: unknown;
  business?: unknown;
  email?: unknown;
  phone?: unknown;
  industry?: unknown;
  hasWebsite?: unknown;
  currentWebsite?: unknown;
  competitorUrl?: unknown;
  packageInterest?: unknown;
  timeline?: unknown;
  features?: unknown;
  contentReady?: unknown;
  message?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!rateLimit(`quote:post:${getClientIp(request)}`, POST_LIMIT, POST_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests — please try again later." }, { status: 429 });
  }

  let payload: QuotePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "That request wasn't formatted correctly." },
      { status: 400 }
    );
  }

  const name = str(payload.name);
  const business = str(payload.business);
  const email = str(payload.email);
  const industry = str(payload.industry);

  if (!name || !business || !email || !industry) {
    return NextResponse.json(
      { error: "Name, business name, email, and industry are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 }
    );
  }

  const hasWebsite = str(payload.hasWebsite);
  const phone = str(payload.phone);
  const currentWebsite = str(payload.currentWebsite);
  const competitorUrl = str(payload.competitorUrl);
  const packageInterest = str(payload.packageInterest);
  const timeline = str(payload.timeline);
  const contentReady = str(payload.contentReady);
  const message = str(payload.message);
  const features = (
    Array.isArray(payload.features)
      ? payload.features.filter((f): f is string => typeof f === "string")
      : []
  ).slice(0, MAX_FEATURES);

  if (
    name.length > MAX_SHORT_LEN ||
    business.length > MAX_SHORT_LEN ||
    email.length > MAX_SHORT_LEN ||
    industry.length > MAX_SHORT_LEN ||
    phone.length > MAX_SHORT_LEN ||
    packageInterest.length > MAX_SHORT_LEN ||
    timeline.length > MAX_SHORT_LEN ||
    contentReady.length > MAX_SHORT_LEN ||
    currentWebsite.length > MAX_URL_LEN ||
    competitorUrl.length > MAX_URL_LEN ||
    message.length > MAX_LONG_LEN ||
    features.some((f) => f.length > MAX_FEATURE_LEN)
  ) {
    return NextResponse.json({ error: "One of those fields is too long." }, { status: 400 });
  }

  const record: QuoteRecord = {
    full_name: name,
    email,
    phone: phone || null,
    business_name: business,
    industry,
    has_website: hasWebsite === "yes" || hasWebsite === "no" ? hasWebsite : null,
    current_website: currentWebsite || null,
    competitor_url: competitorUrl || null,
    package_interested: packageInterest || null,
    timeline: timeline || null,
    features,
    content_ready: contentReady || null,
    additional_notes: message || null,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[api/quote] Supabase env vars are not configured.");
    return NextResponse.json(
      { error: "The backend isn't fully configured yet. Please email us directly for now." },
      { status: 503 }
    );
  }

  let quoteId: string;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("quotes")
      .insert(record)
      .select("id")
      .single();

    if (error) throw error;
    quoteId = data.id;
  } catch (error) {
    console.error("[api/quote] Failed to save quote:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your request. Please try again." },
      { status: 500 }
    );
  }

  // Email is best-effort — the quote is already saved, so a Resend hiccup
  // shouldn't turn into a failed submission for the visitor. Sent after the
  // response goes out so the visitor isn't waiting on two Resend round trips.
  if (process.env.RESEND_API_KEY) {
    after(async () => {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.ADMIN_FROM_EMAIL || "onboarding@resend.dev";
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

        const notifications: Promise<unknown>[] = [];

        if (adminEmail) {
          const admin = adminNotificationEmail(record);
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

        const client = clientConfirmationEmail(record);
        notifications.push(
          resend.emails.send({
            from: fromAddress,
            to: email,
            subject: client.subject,
            html: client.html,
          })
        );

        await Promise.allSettled(notifications);
      } catch (error) {
        console.error("[api/quote] Email delivery failed:", error);
      }
    });
  } else {
    console.warn("[api/quote] RESEND_API_KEY not set — skipping email delivery.");
  }

  return NextResponse.json({ ok: true, id: quoteId }, { status: 201 });
}
