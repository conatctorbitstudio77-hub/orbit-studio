import { site } from "@/lib/site";
import { BUSINESS_TIMEZONE_LABEL, formatSlotLabel } from "@/lib/booking";

export type BookingRecord = {
  event_date: string;
  event_time: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  notes: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function row(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 0;color:#6b6f7d;font-size:13px;vertical-align:top;white-space:nowrap;padding-right:16px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#14161c;font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
}

/** Internal notification — sent to ADMIN_NOTIFICATION_EMAIL when someone books a call. */
export function adminBookingEmail(booking: BookingRecord) {
  const when = `${formatDateLabel(booking.event_date)} at ${formatSlotLabel(booking.event_time)} (${BUSINESS_TIMEZONE_LABEL})`;
  const rows = [
    row("When", when),
    row("Name", booking.contact_name),
    row("Email", booking.contact_email),
    row("Phone", booking.contact_phone),
    row("Notes", booking.notes),
  ].join("");

  return {
    subject: `New call booked — ${formatDateLabel(booking.event_date)}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#14161c;font-size:18px;margin:0 0 16px;">New call booked</h2>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
      </div>
    `,
  };
}

/** Confirmation sent to the client who booked the call. */
export function clientBookingConfirmationEmail(booking: BookingRecord) {
  const firstName = booking.contact_name.split(" ")[0] || booking.contact_name;
  const when = `${formatDateLabel(booking.event_date)} at ${formatSlotLabel(booking.event_time)} (${BUSINESS_TIMEZONE_LABEL})`;

  return {
    subject: `Call confirmed — ${site.name}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;color:#14161c;">
        <p style="font-size:16px;font-weight:600;margin:0 0 12px;">You're booked, ${escapeHtml(firstName)}.</p>
        <p style="font-size:14px;line-height:1.6;color:#3a3d47;margin:0 0 12px;">
          We'll call you <strong>${escapeHtml(when)}</strong>${booking.contact_phone ? ` at ${escapeHtml(booking.contact_phone)}` : ""}.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#3a3d47;margin:0;">
          Need to reschedule? Just reply to this email, or reach us at ${site.email}.
        </p>
      </div>
    `,
  };
}
