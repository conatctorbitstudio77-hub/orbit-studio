# Launch Checklist

Everything the code can do is done. These are the manual, one-time steps
left before the backend and admin panel go live.

## 1. Supabase

- [ ] Create a free project at [supabase.com](https://supabase.com)
- [ ] Open **SQL Editor → New query**, paste the contents of
      [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
      and run it. This creates `quotes`, `case_studies`, `blog_posts`, and
      their RLS policies.
- [ ] Go to **Settings → API** and copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret —
    it bypasses Row Level Security entirely)
- [ ] Go to **Authentication → Users → Add user** and create the one admin
      account by hand (email + password). There's no public sign-up flow —
      that's intentional.

## 2. Resend

- [ ] Create a free account at [resend.com](https://resend.com)
- [ ] **Domains → Add Domain**, then add the DNS records it gives you at
      your domain registrar. Until this is verified, Resend can only send
      from its own sandbox address to your own verified email — real
      quote-confirmation emails to clients won't deliver.
- [ ] **API Keys → Create API Key** → `RESEND_API_KEY`
- [ ] Decide the two addresses:
  - `ADMIN_NOTIFICATION_EMAIL` — where new-quote alerts land (your inbox)
  - `ADMIN_FROM_EMAIL` — must be `something@your-verified-domain`, e.g.
    `hello@orbitstudio.co`

## 3. Environment variables

- [ ] Copy `.env.local.example` → `.env.local` and fill in the six values
      above for local testing.
- [ ] In Vercel: **Project → Settings → Environment Variables**, add the
      same six variables for the Production (and Preview, if you want a
      working staging environment) scope.

## 4. Replace remaining placeholders

Current values in [`src/lib/site.ts`](src/lib/site.ts):

- [ ] `phone` — still `(555) 010-2040`
- [ ] `url` — still `https://orbitstudio.co`; update once the real domain
      is attached in Vercel, since this feeds metadata, the sitemap, and
      the JSON-LD schema

## 5. Deploy

- [ ] Push to the connected Git repo (or `vercel deploy`) with the env vars
      already set — the build will fail fast if any are missing, since
      `/api/quote` and every `/admin` route check for them explicitly.
- [ ] Confirm `/admin` doesn't appear in `robots.txt`'s allowed paths
      (already excluded by default).

## 6. End-to-end test on production

- [ ] Submit a real quote through the live 4-step form
- [ ] Confirm the row appears in Supabase (`quotes` table) and in
      `/admin/quotes`
- [ ] Confirm both emails arrive — the admin notification and the client
      confirmation
- [ ] Sign in at `/admin/login`, publish a test case study and a test blog
      post, confirm they replace the placeholder cards on `/work` and
      `/blog`, then unpublish/delete them
