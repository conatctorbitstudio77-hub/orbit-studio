import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Eyebrow, Section } from "@/components/Section";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Orbit Studio exists: fixed-price, high-performance websites for local service businesses, built by a founder who picks up the phone.",
};

const values = [
  {
    title: "Fixed price, no lock-in",
    body: "You pay once for the build. No monthly platform fee, no surprise invoices, no leverage over your own website.",
  },
  {
    title: "Speed is the pitch, not a feature",
    body: "This audience's biggest complaint is 'my site is slow and ugly.' Orbit Studio's own site has to be the proof, not just the promise.",
  },
  {
    title: "A real support window",
    body: "30–60 days of genuine post-launch support, bounded and clear — a safety net, not an open-ended obligation.",
  },
  {
    title: "Few clients, high touch",
    body: "We work with a handful of businesses at a time so every build gets a real consultative process, not a queue.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="border-b border-border pt-16">
        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Built for the businesses everyone else&apos;s templates ignore.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Orbit Studio builds one-time, fixed-price websites for local
            service businesses — HVAC, plumbing, electrical, roofing,
            landscaping, and more. No subscriptions. No agencies billing you
            forever for a site you already paid for.
          </p>
        </Reveal>
      </Section>

      <Section className="border-b border-border">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          {values.map((value) => (
            <RevealItem key={value.title}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6">
                <p className="font-display text-lg font-medium">
                  {value.title}
                </p>
                <p className="mt-2 text-sm text-muted">{value.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <Reveal>
          <div className="rounded-3xl border border-border bg-surface px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Let&apos;s talk about what you&apos;re losing to a bad website.
            </h2>
            <Button href="/contact" className="mt-6">
              Get a Free Quote
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
