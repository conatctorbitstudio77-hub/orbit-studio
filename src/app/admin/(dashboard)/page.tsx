import type { Metadata } from "next";
import { BlogSection } from "@/components/admin/dashboard/BlogSection";
import { CalendarSection } from "@/components/admin/dashboard/CalendarSection";
import { CaseStudiesSection } from "@/components/admin/dashboard/CaseStudiesSection";
import { ClientsSection } from "@/components/admin/dashboard/ClientsSection";
import { OverviewSection } from "@/components/admin/dashboard/OverviewSection";
import { QuotesSection } from "@/components/admin/dashboard/QuotesSection";
import { SettingsSection } from "@/components/admin/dashboard/SettingsSection";
import { createClient } from "@/lib/supabase/server";
import type {
  BlogPostRecord,
  CalendarEventRecord,
  ClientRecord,
  FaqRecord,
  PricingTierRecord,
  Quote,
  CaseStudyRecord,
  SiteSettingsRecord,
} from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    quotesRes,
    caseStudiesRes,
    postsRes,
    clientsRes,
    eventsRes,
    settingsRes,
    tiersRes,
    faqsRes,
  ] = await Promise.all([
    supabase.from("quotes").select("*").order("created_at", { ascending: false }).returns<Quote[]>(),
    supabase
      .from("case_studies")
      .select("*")
      .order("display_order", { ascending: true })
      .returns<CaseStudyRecord[]>(),
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).returns<BlogPostRecord[]>(),
    supabase.from("clients").select("*").order("created_at", { ascending: false }).returns<ClientRecord[]>(),
    supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true })
      .returns<CalendarEventRecord[]>(),
    supabase.from("site_settings").select("*").eq("id", true).single<SiteSettingsRecord>(),
    supabase
      .from("pricing_tiers")
      .select("*")
      .order("kind", { ascending: true })
      .order("display_order", { ascending: true })
      .returns<PricingTierRecord[]>(),
    supabase.from("faqs").select("*").order("display_order", { ascending: true }).returns<FaqRecord[]>(),
  ]);

  const quotes = quotesRes.data || [];
  const caseStudies = caseStudiesRes.data || [];
  const posts = postsRes.data || [];
  const clients = clientsRes.data || [];
  const events = eventsRes.data || [];
  const settings = settingsRes.data;
  const pricingTiers = tiersRes.data || [];
  const faqs = faqsRes.data || [];

  const errors = [
    quotesRes.error,
    caseStudiesRes.error,
    postsRes.error,
    clientsRes.error,
    eventsRes.error,
    tiersRes.error,
    faqsRes.error,
  ].filter(Boolean);
  if (errors.length) {
    console.error("[admin] Failed to load some dashboard data:", errors);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <>
      {errors.length > 0 && (
        <div className="mt-6 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-text">
          Some data couldn&apos;t load — this usually means the admin_dashboard
          migration (supabase/migrations/0002_admin_dashboard.sql) hasn&apos;t
          been run yet against this project.
        </div>
      )}

      <OverviewSection
        quotesTotal={quotes.length}
        quotesWon={quotes.filter((q) => q.status === "won").length}
        quotesOpen={quotes.filter((q) => q.status === "new" || q.status === "contacted").length}
        upcomingCount={events.filter((e) => e.event_date >= todayStr).length}
        clientsCount={clients.length}
        publishedCount={posts.filter((p) => p.published).length}
        postsTotal={posts.length}
      />

      <QuotesSection quotes={quotes} />

      <CalendarSection events={events} />

      <CaseStudiesSection caseStudies={caseStudies} />

      <BlogSection posts={posts} />

      <ClientsSection clients={clients} />

      <SettingsSection settings={settings ?? null} pricingTiers={pricingTiers} faqs={faqs} />
    </>
  );
}
