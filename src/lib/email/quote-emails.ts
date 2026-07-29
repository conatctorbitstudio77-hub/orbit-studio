import { site } from "@/lib/site";

export type QuoteRecord = {
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string;
  industry: string;
  has_website: string | null;
  current_website: string | null;
  competitor_url: string | null;
  package_interested: string | null;
  timeline: string | null;
  features: string[];
  content_ready: string | null;
  additional_notes: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 0;color:#6b6f7d;font-size:13px;vertical-align:top;white-space:nowrap;padding-right:16px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#14161c;font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
}

/** Internal notification — every field, formatted clearly, sent to ADMIN_NOTIFICATION_EMAIL. */
export function adminNotificationEmail(quote: QuoteRecord) {
  const rows = [
    row("Name", quote.full_name),
    row("Business", quote.business_name),
    row("Email", quote.email),
    row("Phone", quote.phone),
    row("Industry", quote.industry),
    row("Has a website?", quote.has_website),
    row("Current website", quote.current_website),
    row("Competitor / inspiration", quote.competitor_url),
    row("Package interested in", quote.package_interested),
    row("Timeline", quote.timeline),
    row("Features wanted", quote.features?.length ? quote.features.join(", ") : null),
    row("Content ready?", quote.content_ready),
    row("Notes", quote.additional_notes),
  ].join("");

  return {
    subject: `New quote request — ${quote.business_name}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#14161c;font-size:18px;margin:0 0 16px;">New quote request</h2>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
      </div>
    `,
  };
}

/** Confirmation sent to the client's own submitted email address. */
export function clientConfirmationEmail(quote: QuoteRecord) {
  const firstName = quote.full_name.split(" ")[0] || quote.full_name;

  return {
    subject: `We got your request — ${site.name}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;color:#14161c;">
        <p style="font-size:16px;font-weight:600;margin:0 0 12px;">Thanks, ${escapeHtml(firstName)} — that's in.</p>
        <p style="font-size:14px;line-height:1.6;color:#3a3d47;margin:0 0 12px;">
          We reply to every quote request within one business day with a firm
          price based on what you told us about ${escapeHtml(quote.business_name)}.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#3a3d47;margin:0;">
          In the meantime, feel free to reply directly to this email, or reach
          us at ${site.email}.
        </p>
      </div>
    `,
  };
}
