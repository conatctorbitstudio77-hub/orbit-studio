-- Orbit Studio — client call booking
-- Extends calendar_events (built in 0002) so a client booking a call
-- shows up as a Meeting on the same admin calendar, instead of a
-- separate disconnected system. Run after 0001 and 0002.

alter table calendar_events
  add column if not exists event_time time,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'booking'));

-- Prevents two clients double-booking the identical date+time slot.
-- Only applies to rows that actually have a time (manual deadlines/
-- deliverables without a specific time are unaffected).
create unique index if not exists calendar_events_slot_unique
  on calendar_events (event_date, event_time)
  where event_time is not null;

-- No public RLS policy is added here on purpose — availability and
-- booking both go through app/api/booking/route.ts using the
-- service-role client, the same pattern as /api/quote. This keeps
-- contact_name/email/phone from ever being readable by anon visitors,
-- since Supabase's existing "Admin can manage" policy already covers
-- authenticated (admin) access to these new columns.
