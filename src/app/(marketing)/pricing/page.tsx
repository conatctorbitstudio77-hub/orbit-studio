import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PricingSwitcher } from "@/components/PricingSwitcher";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { pricingFaqs } from "@/lib/site";
import { getPricingTiers } from "@/lib/supabase/content";

export const metadata: Metadata = {
  title: "Pricing — Simple Pricing for Every Stage of Growth",
  description:
    "Buy your website once and own it outright, then keep it fast, secure, and growing with an optional Orbit Care plan. No lock-in, cancel anytime.",
};

export default async function PricingPage() {
  const { oneTime, monthly } = await getPricingTiers();

  return (
    <>
      <Section className="border-b border-border pt-16 text-center">
        <Reveal>
          <div className="mx-auto flex flex-col items-center">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Simple pricing for every stage of growth.
            </h1>
            <p className="mt-4 max-w-xl text-muted">
              Buy your website once and own it outright — then keep it fast,
              secure and growing with an optional Orbit Care plan. No
              lock-in, cancel anytime.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section className="border-b border-border">
        <Reveal>
          <PricingSwitcher oneTime={oneTime} monthly={monthly} />
        </Reveal>

        <Reveal>
          <p className="mt-16 text-center text-sm text-muted">
            Every Orbit website includes full ownership, mobile optimization,
            and a real support window after launch.
          </p>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight">
            Good to know before you choose.
          </h2>
        </Reveal>

        <Reveal>
          <div className="mt-10">
            <FaqAccordion items={pricingFaqs} />
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-16 rounded-3xl border border-border bg-surface px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Not sure which one fits?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Tell us about your business and we&apos;ll recommend a package
              with a firm price — no pressure, no retainer.
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
