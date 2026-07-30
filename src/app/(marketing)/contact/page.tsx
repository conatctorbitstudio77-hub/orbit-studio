import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Tell us about your business and get a fixed-price quote for a website that actually books jobs.",
};

export default function ContactPage() {
  return (
    <Section className="pt-16">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Eyebrow>Get a free quote</Eyebrow>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Let&apos;s talk about your website.
          </h1>
          <p className="mt-4 max-w-sm text-muted">
            One real conversation, a firm fixed-price quote, no pressure. We
            reply within one business day.
          </p>

          <div className="mt-10 space-y-3 text-sm">
            <p className="text-muted">Prefer to reach out directly?</p>
            <p className="font-medium">{site.email}</p>
            <p className="font-medium">{site.phone}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
