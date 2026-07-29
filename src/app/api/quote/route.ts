import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminNotificationEmail,
  clientConfirmationEmail,
  type QuoteRecord,
} from "@/lib/email/quote-emails";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const features = Array.isArray(payload.features)
    ? payload.features.filter((f): f is string => typeof f === "string")
    : [];

  const record: QuoteRecord = {
    full_name: name,
    email,
    phone: str(payload.phone) || null,
    business_name: business,
    industry,
    has_website: hasWebsite === "yes" || hasWebsite === "no" ? hasWebsite : null,
    current_website: str(payload.currentWebsite) || null,
    competitor_url: str(payload.competitorUrl) || null,
    package_interested: str(payload.packageInterest) || null,
    timeline: str(payload.timeline) || null,
    features,
    content_ready: str(payload.contentReady) || null,
    additional_notes: str(payload.message) || null,
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
  // shouldn't turn into a failed submission for the visitor.
  if (process.env.RESEND_API_KEY) {
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
  } else {
    console.warn("[api/quote] RESEND_API_KEY not set — skipping email delivery.");
  }

  return NextResponse.json({ ok: true, id: quoteId }, { status: 201 });
}
