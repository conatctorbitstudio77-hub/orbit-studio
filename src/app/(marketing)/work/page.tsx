import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Eyebrow, Section } from "@/components/Section";
import { WorkCard, type WorkCardData } from "@/components/WorkCard";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { caseStudies as placeholderCaseStudies } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";
import type { CaseStudyRecord } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: "Our Work — Case Studies",
  description:
    "Real websites built for real local service businesses. Every case study links to a live site — no mockups.",
};

// Case studies are admin-editable in Supabase — render dynamically so
// publishing one shows immediately instead of waiting for the next deploy.
export const dynamic = "force-dynamic";

const placeholders: WorkCardData[] = placeholderCaseStudies.map((cs) => ({
  slug: cs.slug,
  title: cs.client,
  industry: cs.industry,
  badge: cs.result,
  summary: cs.summary,
  thumbnailUrl: null,
}));

/**
 * Fetches published case studies from Supabase. Falls back to the
 * static "coming soon" placeholders on any failure — missing env vars,
 * a Supabase outage, or simply zero published rows — so this page can
 * never show a broken or empty state.
 */
async function getCaseStudies(): Promise<WorkCardData[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .returns<CaseStudyRecord[]>();

    if (error || !data || data.length === 0) {
      return placeholders;
    }

    return data.map((cs) => ({
      slug: cs.slug,
      title: cs.title,
      industry: cs.industry,
      badge: cs.results || "Live project",
      summary: cs.summary,
      thumbnailUrl: cs.thumbnail_url,
    }));
  } catch (error) {
    console.error("[work] Falling back to placeholder case studies:", error);
    return placeholders;
  }
}

export default async function WorkPage() {
  const items = await getCaseStudies();

  return (
    <>
      <Section className="border-b border-border pt-16">
        <Reveal>
          <Eyebrow>Our work</Eyebrow>
          <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Real sites. Real clients. No mockups.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            We&apos;re building our first cohort of case studies right now.
            Every project we ship gets published here — results,
            before/after, and a link to the live site — the same standard we
            hold our own site to.
          </p>
        </Reveal>
      </Section>

      <Section>
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {items.map((study, i) => (
            <RevealItem key={study.slug}>
              <WorkCard study={study} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal>
          <div className="mt-16 rounded-3xl border border-border bg-surface px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Want to be our next case study?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Early clients get a founder-led build process and a case study
              that sends you referrals for years.
            </p>
            <Button href="/contact" className="mt-6">
              Get a Free Quote
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
