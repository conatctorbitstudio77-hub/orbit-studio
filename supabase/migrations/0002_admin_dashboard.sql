-- Orbit Studio — admin dashboard v2 (calendar, clients, site settings/pricing/FAQ)
-- Run this in the Supabase SQL editor after 0001_init.sql.

-- ============================================================
-- clients
-- ============================================================
-- Businesses on the books. Can be added manually, or auto-created by the
-- handle_quote_won() trigger below when a quote's status flips to 'won'.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  business_name text not null,
  contact_name text,
  industry text,
  site_status text not null default 'planned'
    check (site_status in ('live', 'in_progress', 'planned')),

  -- Set only when this client was auto-created from a won quote. Unique so
  -- the trigger can safely no-op (ON CONFLICT) if a quote is re-marked won.
  quote_id uuid references quotes(id) on delete set null unique
);

alter table clients enable row level security;

create policy "Admin can manage clients"
  on clients for all
  to authenticated
  using (true)
  with check (true);

create index if not exists clients_created_at_idx on clients (created_at desc);


-- ============================================================
-- Won quote -> client automation
-- ============================================================
-- security definer so the insert succeeds regardless of which role
-- triggered the update (admin browser session or the service-role API).

create or replace function public.handle_quote_won()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'won' and (old.status is distinct from 'won') then
    insert into clients (business_name, contact_name, industry, site_status, quote_id)
    values (new.business_name, new.full_name, new.industry, 'planned', new.id)
    on conflict (quote_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_quote_won on quotes;
create trigger on_quote_won
  after update on quotes
  for each row
  execute function public.handle_quote_won();


-- ============================================================
-- calendar_events
-- ============================================================
-- Internal project deadlines/deliverables/meetings — never public.

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  event_date date not null,
  title text not null,
  type text not null default 'Deadline'
    check (type in ('Deadline', 'Deliverable', 'Meeting'))
);

alter table calendar_events enable row level security;

create policy "Admin can manage calendar events"
  on calendar_events for all
  to authenticated
  using (true)
  with check (true);

create index if not exists calendar_events_date_idx on calendar_events (event_date);


-- ============================================================
-- site_settings (singleton row — homepage hero copy)
-- ============================================================

create table if not exists site_settings (
  id boolean primary key default true check (id),
  hero_title text,
  hero_subtitle text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (true) on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "Public can read site settings"
  on site_settings for select
  to anon, authenticated
  using (true);

create policy "Admin can update site settings"
  on site_settings for update
  to authenticated
  using (true)
  with check (true);


-- ============================================================
-- pricing_tiers
-- ============================================================
-- Mirrors the shape of src/lib/site.ts's Tier type so the real pricing
-- page (One-Time / Monthly toggle, featured badge, bullet list) stays
-- fully intact once driven from the database instead of hardcoded data.

create table if not exists pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  kind text not null check (kind in ('one-time', 'monthly')),
  name text not null,
  tagline text,
  price text not null,
  billing_label text not null default 'one-time',
  best_for text,
  includes text[] not null default '{}',
  featured boolean not null default false,
  display_order integer not null default 0
);

alter table pricing_tiers enable row level security;

create policy "Public can read pricing tiers"
  on pricing_tiers for select
  to anon, authenticated
  using (true);

create policy "Admin can manage pricing tiers"
  on pricing_tiers for all
  to authenticated
  using (true)
  with check (true);

create index if not exists pricing_tiers_kind_order_idx on pricing_tiers (kind, display_order);


-- ============================================================
-- faqs (drives the site-wide /faq page)
-- ============================================================

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  question text not null,
  answer text not null,
  display_order integer not null default 0
);

alter table faqs enable row level security;

create policy "Public can read faqs"
  on faqs for select
  to anon, authenticated
  using (true);

create policy "Admin can manage faqs"
  on faqs for all
  to authenticated
  using (true)
  with check (true);

create index if not exists faqs_order_idx on faqs (display_order);
