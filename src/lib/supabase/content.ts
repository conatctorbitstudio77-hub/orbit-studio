import { createPublicClient } from "@/lib/supabase/public";
import { site, tiers as defaultTiers, carePlans as defaultCarePlans, type Tier } from "@/lib/site";
import { faqs as defaultFaqs, type Faq } from "@/lib/faq";
import type { PricingTierRecord, SiteSettingsRecord, FaqRecord } from "@/lib/admin/types";

/**
 * CMS-backed content for the public site — hero copy, pricing tiers, FAQ.
 * Every function falls back to the hardcoded defaults in lib/site.ts /
 * lib/faq.ts on any failure (missing env vars, empty table, network
 * error), so these pages can never end up broken or empty because the
 * admin dashboard migration hasn't been run yet.
 */

export async function getHeroCopy(): Promise<{ title: string; subtitle: string }> {
  const fallback = {
    title: "Stop losing jobs to the competitor with the better website.",
    subtitle: site.description,
  };
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", true)
      .single<SiteSettingsRecord>();
    if (error || !data) return fallback;
    return {
      title: data.hero_title?.trim() || fallback.title,
      subtitle: data.hero_subtitle?.trim() || fallback.subtitle,
    };
  } catch (error) {
    console.error("[content] Falling back to default hero copy:", error);
    return fallback;
  }
}

function toTier(row: PricingTierRecord): Tier {
  return {
    name: row.name,
    tagline: row.tagline || "",
    price: row.price,
    billingLabel: row.billing_label,
    bestFor: row.best_for || "",
    includes: row.includes,
    featured: row.featured,
  };
}

export async function getPricingTiers(): Promise<{ oneTime: Tier[]; monthly: Tier[] }> {
  const fallback = { oneTime: defaultTiers, monthly: defaultCarePlans };
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pricing_tiers")
      .select("*")
      .order("display_order", { ascending: true })
      .returns<PricingTierRecord[]>();
    if (error || !data || data.length === 0) return fallback;
    return {
      oneTime: data.filter((t) => t.kind === "one-time").map(toTier),
      monthly: data.filter((t) => t.kind === "monthly").map(toTier),
    };
  } catch (error) {
    console.error("[content] Falling back to default pricing tiers:", error);
    return fallback;
  }
}

export async function getFaqs(): Promise<Faq[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .returns<FaqRecord[]>();
    if (error || !data || data.length === 0) return defaultFaqs;
    return data.map((f) => ({ question: f.question, answer: f.answer }));
  } catch (error) {
    console.error("[content] Falling back to default FAQs:", error);
    return defaultFaqs;
  }
}
