-- Orbit Studio — initial schema (quotes, case_studies, blog_posts)
-- Run this in the Supabase SQL editor (Database → SQL Editor → New query).

-- ============================================================
-- quotes
-- ============================================================
-- Column set is expanded slightly beyond the original build-plan
-- spec to match every field the live 4-step quote wizard actually
-- collects (has_website / current_website / competitor_url /
-- features / content_ready) — nothing submitted should be dropped.

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'won', 'lost')),

  full_name text not null,
  email text not null,
  phone text,
  business_name text not null,
  industry text not null,

  has_website text check (has_website in ('yes', 'no')),
  current_website text,
  competitor_url text,

  package_interested text,
  timeline text,
  features text[] not null default '{}',
  content_ready text,

  additional_notes text
);

alter table quotes enable row level security;

-- No public access at all — inserts happen via the service-role client
-- in app/api/quote/route.ts, which bypasses RLS entirely. Only the
-- authenticated admin can read/update/delete from the admin panel.
create policy "Admin can manage quotes"
  on quotes for all
  to authenticated
  using (true)
  with check (true);


-- ============================================================
-- case_studies
-- ============================================================

create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  title text not null,
  slug text not null unique,
  industry text not null,
  summary text not null,
  results text,
  thumbnail_url text,

  published boolean not null default false,
  display_order integer not null default 0
);

alter table case_studies enable row level security;

create policy "Public can read published case studies"
  on case_studies for select
  to anon, authenticated
  using (published = true);

create policy "Admin can manage case studies"
  on case_studies for all
  to authenticated
  using (true)
  with check (true);


-- ============================================================
-- blog_posts
-- ============================================================

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null,

  published boolean not null default false,
  published_at timestamptz
);

alter table blog_posts enable row level security;

create policy "Public can read published posts"
  on blog_posts for select
  to anon, authenticated
  using (published = true);

create policy "Admin can manage posts"
  on blog_posts for all
  to authenticated
  using (true)
  with check (true);


-- ============================================================
-- indexes
-- ============================================================

create index if not exists quotes_created_at_idx on quotes (created_at desc);
create index if not exists case_studies_published_order_idx
  on case_studies (published, display_order);
create index if not exists blog_posts_published_at_idx
  on blog_posts (published, published_at desc);
