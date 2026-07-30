import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getFaqs } from "@/lib/supabase/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers about pricing, timelines, ownership, and support — before you get on a call.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Section className="border-b border-border pt-16">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Straight answers, before you get on a call.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            The questions we hear most from local service business owners —
            pricing, timelines, ownership, and what happens after launch.
          </p>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <FaqAccordion items={faqs} />
        </Reveal>

        <Reveal>
          <div className="mt-16 rounded-3xl border border-border bg-surface px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Still have a question?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Ask us directly — no forms required if you&apos;d rather just talk.
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
