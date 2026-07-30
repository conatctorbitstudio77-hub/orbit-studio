"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminTag,
  Kicker,
  SectionHeading,
  adminInputClass,
} from "@/components/admin/ui";
import { formatSlotLabel } from "@/lib/booking";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEventRecord, CalendarEventType } from "@/lib/admin/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EVENT_TYPES: CalendarEventType[] = ["Deadline", "Deliverable", "Meeting"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function isoOf(y: number, m: number, d: number) {
  const date = new Date(y, m, d);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

type Cell = {
  key: string;
  label: number;
  inMonth: boolean;
  dateStr: string | null;
  events: CalendarEventRecord[];
};

export function CalendarSection({ events }: { events: CalendarEventRecord[] }) {
  const router = useRouter();
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<CalendarEventType>("Deadline");
  const [busy, setBusy] = useState(false);

  const todayStr = isoOf(now.getFullYear(), now.getMonth(), now.getDate());

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventRecord[]> = {};
    for (const ev of events) {
      (map[ev.event_date] ||= []).push(ev);
    }
    return map;
  }, [events]);

  const cells: Cell[] = useMemo(() => {
    const firstDow = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();

    const list: Cell[] = [];
    for (let i = 0; i < firstDow; i++) {
      list.push({
        key: `p${i}`,
        label: daysInPrev - firstDow + 1 + i,
        inMonth: false,
        dateStr: null,
        events: [],
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = isoOf(calYear, calMonth, d);
      list.push({ key: dateStr, label: d, inMonth: true, dateStr, events: eventsByDate[dateStr] || [] });
    }
    let n = 1;
    while (list.length % 7 !== 0 || list.length < 42) {
      list.push({ key: `n${n}`, label: n, inMonth: false, dateStr: null, events: [] });
      n++;
    }
    return list;
  }, [calYear, calMonth, eventsByDate]);

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((ev) => ev.event_date >= todayStr)
        .sort((a, b) => {
          const dateCompare = a.event_date.localeCompare(b.event_date);
          if (dateCompare !== 0) return dateCompare;
          return (a.event_time || "").localeCompare(b.event_time || "");
        })
        .slice(0, 6),
    [events, todayStr]
  );

  function prevMonth() {
    setSelectedDate(null);
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }
  function nextMonth() {
    setSelectedDate(null);
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  async function addEvent() {
    if (!draftTitle.trim() || !selectedDate) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("calendar_events").insert({
      event_date: selectedDate,
      title: draftTitle.trim(),
      type: draftType,
    });
    setBusy(false);
    if (error) {
      console.error("[CalendarSection] Failed to add event:", error);
      window.alert("Couldn't save — try again.");
      return;
    }
    setDraftTitle("");
    setDraftType("Deadline");
    router.refresh();
  }

  async function removeEvent(id: string) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    setBusy(false);
    if (error) {
      console.error("[CalendarSection] Failed to remove event:", error);
      window.alert("Couldn't remove — try again.");
      return;
    }
    router.refresh();
  }

  const selectedDayEvents = useMemo(() => {
    const list = selectedDate ? eventsByDate[selectedDate] || [] : [];
    return [...list].sort((a, b) => (a.event_time || "").localeCompare(b.event_time || ""));
  }, [selectedDate, eventsByDate]);
  const selectedDateLabel = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        return `${MONTHS[m - 1]} ${d}, ${y}`;
      })()
    : "";

  return (
    <section id="calendar" className="mt-12 border-t border-border pb-2 pt-14">
      <SectionHeading
        kicker="Deadlines & deliverables"
        title="Calendar"
        action={
          <div className="flex items-center gap-3">
            <AdminButton onClick={prevMonth} aria-label="Previous month">
              &larr;
            </AdminButton>
            <span className="min-w-[160px] text-center font-display text-lg font-semibold uppercase tracking-wide">
              {MONTHS[calMonth]} {calYear}
            </span>
            <AdminButton onClick={nextMonth} aria-label="Next month">
              &rarr;
            </AdminButton>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[7fr_4fr]">
        <div>
          <div className="grid grid-cols-7 gap-px border border-border bg-border">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="bg-background px-1 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {wd}
              </div>
            ))}
            {cells.map((cell) => {
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr !== null && cell.dateStr === selectedDate;
              return (
                <div
                  key={cell.key}
                  onClick={cell.inMonth && cell.dateStr ? () => setSelectedDate((d) => (d === cell.dateStr ? null : cell.dateStr)) : undefined}
                  className={`flex min-h-[74px] flex-col gap-1 border border-border p-1.5 ${
                    cell.inMonth ? "cursor-pointer" : "cursor-default opacity-40"
                  } ${isSelected ? "bg-accent" : isToday ? "bg-accent/15" : "bg-background"}`}
                >
                  <span className={`text-xs font-semibold ${isSelected ? "text-ink" : "text-foreground"}`}>
                    {cell.label}
                  </span>
                  {cell.events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`overflow-hidden text-ellipsis whitespace-nowrap px-1 py-0.5 text-[10px] leading-tight ${
                        isSelected ? "bg-ink/20 text-ink" : "bg-accent text-ink"
                      }`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="relative mt-5 border border-border bg-surface p-6">
              <Kicker>{selectedDateLabel}</Kicker>
              <div className="mt-2 grid items-end gap-3 md:grid-cols-[2fr_1fr_auto]">
                <AdminField label="New deadline / deliverable">
                  <input
                    className={adminInputClass}
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="e.g. da'spot — final files due"
                  />
                </AdminField>
                <AdminField label="Type">
                  <select
                    className={adminInputClass}
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value as CalendarEventType)}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminButton variant="primary" onClick={addEvent} disabled={busy}>
                  Add
                </AdminButton>
              </div>

              {selectedDayEvents.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {selectedDayEvents.map((ev) => (
                    <div key={ev.id} className="border-t border-border pt-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex flex-wrap items-center gap-2">
                          {ev.event_time && (
                            <span className="font-display text-sm font-semibold text-accent-text">
                              {formatSlotLabel(ev.event_time)}
                            </span>
                          )}
                          <AdminTag variant={ev.source === "booking" ? "accent" : "neutral"}>
                            {ev.source === "booking" ? "Booked call" : ev.type}
                          </AdminTag>
                          <span>{ev.title}</span>
                        </span>
                        <AdminButton onClick={() => removeEvent(ev.id)} disabled={busy}>
                          Remove
                        </AdminButton>
                      </div>
                      {ev.source === "booking" && (
                        <p className="mt-1 text-xs text-muted">
                          {[ev.contact_email, ev.contact_phone].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <Kicker>Upcoming</Kicker>
          <div className="grid gap-px border border-border bg-border">
            {upcoming.length === 0 && (
              <div className="bg-background p-4 text-sm text-muted">Nothing scheduled.</div>
            )}
            {upcoming.map((ev) => {
              const [, m, d] = ev.event_date.split("-").map(Number);
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-3 bg-background px-4 py-3"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-accent-text">
                      {MONTHS[m - 1].slice(0, 3)} {d}
                      {ev.event_time && ` · ${formatSlotLabel(ev.event_time)}`}
                    </div>
                    <div className="mt-0.5 text-sm">{ev.title}</div>
                    {ev.source === "booking" && (
                      <div className="mt-0.5 text-xs text-muted">
                        {[ev.contact_email, ev.contact_phone].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <AdminTag variant={ev.source === "booking" ? "accent" : "outline"}>
                    {ev.source === "booking" ? "Booked call" : ev.type}
                  </AdminTag>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
