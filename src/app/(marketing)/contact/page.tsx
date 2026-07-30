import type { Metadata } from "next";
import { BookingWidget } from "@/components/BookingWidget";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { BUSINESS_TIMEZONE_LABEL } from "@/lib/booking";
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

      <Reveal delay={0.15}>
        <div className="mt-16 border-t border-border pt-16">
          <Eyebrow>Prefer to talk it through?</Eyebrow>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Book a call instead.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Pick a time that works — evenings after 5pm on weekdays, or
            anytime on weekends ({BUSINESS_TIMEZONE_LABEL}). We&apos;ll call
            you, no need to fill out the form above.
          </p>
          <div className="mt-8 max-w-2xl">
            <BookingWidget />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
