"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingOrbit } from "@/components/LoadingOrbit";
import {
  BUSINESS_TIMEZONE_LABEL,
  formatSlotLabel,
  generateSlotsForDate,
  isSlotInFuture,
  upcomingDates,
} from "@/lib/booking";
import { site } from "@/lib/site";

const LOOKAHEAD_DAYS = 14;

type DayOption = {
  date: string;
  weekday: string;
  dayNumber: string;
  slots: string[];
};

function formatDayParts(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return {
    weekday: dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    dayNumber: dt.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" }),
  };
}

function formatFullDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function BookingWidget() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [taken, setTaken] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/booking?days=${LOOKAHEAD_DAYS}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setTaken(data.taken || {});
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const days: DayOption[] = useMemo(() => {
    return upcomingDates(LOOKAHEAD_DAYS)
      .map((date) => {
        const bookedTimes = new Set(taken[date] || []);
        const slots = generateSlotsForDate(date).filter(
          (t) => !bookedTimes.has(t) && isSlotInFuture(date, t)
        );
        return { date, ...formatDayParts(date), slots };
      })
      .filter((day) => day.slots.length > 0);
  }, [taken]);

  const activeDay = days.find((d) => d.date === selectedDate) || null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || !selectedDate || !selectedTime) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          name,
          email,
          phone,
          notes,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      setConfirmed(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed && selectedDate && selectedTime) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display text-lg font-medium">You&apos;re booked.</p>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll call you {formatFullDate(selectedDate)} at {formatSlotLabel(selectedTime)}{" "}
          ({BUSINESS_TIMEZONE_LABEL}). A confirmation is on its way to {email}.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
        <LoadingOrbit className="h-8 w-8" />
      </div>
    );
  }

  if (loadError || days.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
        Booking isn&apos;t available right now — email us at {site.email} to set up a call instead.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => {
              setSelectedDate(day.date);
              setSelectedTime(null);
            }}
            className={`flex shrink-0 flex-col items-center gap-0.5 rounded-full border px-4 py-2 text-sm transition-all duration-200 ease-out ${
              selectedDate === day.date
                ? "border-accent bg-accent text-ink"
                : "border-border text-muted hover:border-accent/60 hover:text-foreground"
            }`}
          >
            <span className="text-xs uppercase tracking-wide opacity-80">{day.weekday}</span>
            <span className="font-display font-semibold">{day.dayNumber}</span>
          </button>
        ))}
      </div>

      {activeDay && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent-text">
            {formatFullDate(activeDay.date)} — {BUSINESS_TIMEZONE_LABEL}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeDay.slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 ease-out ${
                  selectedTime === slot
                    ? "border-accent bg-accent text-ink"
                    : "border-border text-muted hover:border-accent/60 hover:text-foreground"
                }`}
              >
                {formatSlotLabel(slot)}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <form onSubmit={submit} className="mt-6 grid gap-4 border-t border-border pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">Phone (optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">Anything to add? (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>

          {submitError && <p className="text-sm text-accent">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting
              ? "Booking…"
              : `Book ${formatFullDate(selectedDate).split(",")[0]} at ${formatSlotLabel(selectedTime)}`}
          </button>
        </form>
      )}
    </div>
  );
}
