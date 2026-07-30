/**
 * Call-booking availability rules, shared by the public booking widget
 * and the API route so both agree on what counts as a valid slot.
 *
 * Rule: weekdays only after 5pm, weekends all day — all times are in
 * the business's own timezone (Atlantic Time / Edmundston, NB), not
 * the visitor's browser timezone, since these are the hours someone
 * local is actually free to take a call.
 */

export const BUSINESS_TIMEZONE = "America/Moncton";
export const BUSINESS_TIMEZONE_LABEL = "Atlantic Time";

const WEEKDAY_WINDOW = { startHour: 17, endHour: 20 }; // 5:00 PM – 8:00 PM
const WEEKEND_WINDOW = { startHour: 9, endHour: 18 }; // 9:00 AM – 6:00 PM
const SLOT_MINUTES = 30;

/** "YYYY-MM-DD" -> is this Saturday or Sunday. Timezone-invariant: a
 * calendar date's weekday doesn't depend on which zone you read it in. */
export function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

export function getWindowForDate(dateStr: string): { startHour: number; endHour: number } {
  return isWeekend(dateStr) ? WEEKEND_WINDOW : WEEKDAY_WINDOW;
}

/** All possible slot start times ("HH:mm:00") for a date, ignoring
 * what's already booked or in the past. */
export function generateSlotsForDate(dateStr: string): string[] {
  const { startHour, endHour } = getWindowForDate(dateStr);
  const slots: string[] = [];
  for (let mins = startHour * 60; mins < endHour * 60; mins += SLOT_MINUTES) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    slots.push(`${h}:${m}:00`);
  }
  return slots;
}

/** Current date/time as plain "YYYY-MM-DD" / "HH:mm:ss" strings, read
 * in the business's own timezone. */
export function getBusinessNow(): { date: string; time: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = get("hour") === "24" ? "00" : get("hour");
  const time = `${hour}:${get("minute")}:${get("second")}`;
  return { date, time };
}

export function isSlotInFuture(dateStr: string, timeStr: string): boolean {
  const { date: nowDate, time: nowTime } = getBusinessNow();
  if (dateStr > nowDate) return true;
  if (dateStr < nowDate) return false;
  return timeStr > nowTime;
}

/** Whether a specific date+time combination is a legal slot at all
 * (matches the weekday/weekend window and isn't already in the past). */
export function isValidSlot(dateStr: string, timeStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return false;
  if (!generateSlotsForDate(dateStr).includes(timeStr)) return false;
  return isSlotInFuture(dateStr, timeStr);
}

/** "17:30:00" -> "5:30 PM" */
export function formatSlotLabel(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

/** N upcoming calendar dates as "YYYY-MM-DD" strings, starting today
 * (in business time), for building the date picker. */
export function upcomingDates(count: number): string[] {
  const { date: todayStr } = getBusinessNow();
  const [y, m, d] = todayStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const dt = new Date(start);
    dt.setUTCDate(start.getUTCDate() + i);
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}
