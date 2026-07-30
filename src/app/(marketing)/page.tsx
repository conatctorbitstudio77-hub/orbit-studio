import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Eyebrow, Section } from "@/components/Section";
import { WorkCard, type WorkCardData } from "@/components/WorkCard";
import { CountUp } from "@/components/motion/CountUp";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { ProcessCards } from "@/components/motion/ProcessCards";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { caseStudies } from "@/lib/site";
import { getHeroCopy, getPricingTiers } from "@/lib/supabase/content";

const workPreview: WorkCardData[] = caseStudies.map((cs) => ({
  slug: cs.slug,
  title: cs.client,
  industry: cs.industry,
  badge: cs.result,
  summary: cs.summary,
  thumbnailUrl: null,
}));

const stats = [
  { kind: "text" as const, value: "3–6 wk", label: "typical build timeline" },
  { kind: "text" as const, value: "$0", label: "recurring fees, ever" },
  {
    kind: "count" as const,
    value: 60,
    suffix: " day",
    label: "launch support included",
  },
  {
    kind: "count" as const,
    value: 2,
    prefix: "<",
    suffix: "s",
    label: "target page load",
  },
];

const process = [
  {
    step: "01",
    title: "Discover",
    body: "One real conversation about the jobs you're losing to competitors who show up first on Google — not a sales script.",
    points: [
      "30-minute call about the jobs you're losing, and why",
      "Quick teardown of your current site and your top competitors",
      "Clear scope and a fixed price before we write a line of code",
    ],
  },
  {
    step: "02",
    title: "Design",
    body: "A layout built for your trade, mapped to how your customers actually search and decide — not a generic template.",
    points: [
      "Layout built around how customers search, compare, and call",
      "Mobile-first — most local searches happen on a phone",
      "Your brand, photos, and trust signals, not stock-template filler",
    ],
  },
  {
    step: "03",
    title: "Build",
    body: "You pick a tier, we quote a fixed price up front. No hourly surprises, no scope creep billed by the hour.",
    points: [
      "Fixed price locked in after Design — no hourly surprises",
      "Live staging link so you watch the site come together",
      "Two structured rounds of revisions included",
    ],
  },
  {
    step: "04",
    title: "Launch",
    body: "30–60 days of real support after launch — bug fixes, tweaks, and the 'this doesn't look right' requests, covered.",
    points: [
      "Full QA pass across devices and browsers before go-live",
      "Domain, hosting, and analytics wired up for you",
      "30–60 days of fixes, tweaks, and support after you're live",
    ],
  },
];

export default async function Home() {
  const [hero, pricing] = await Promise.all([getHeroCopy(), getPricingTiers()]);
  const tiers = pricing.oneTime;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <ParallaxLayer className="h-[140%] w-full">
          <div className="absolute left-[10%] top-0 h-[420px] w-[420px] rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-[5%] top-[15%] h-[380px] w-[380px] rounded-full bg-deep-blue/25 blur-3xl" />
        </ParallaxLayer>

        <Container className="relative flex flex-col items-start gap-8 py-24 md:py-32">
          <Reveal>
            <Eyebrow>Websites for local service businesses</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              {hero.title}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="max-w-xl text-lg text-muted">{hero.subtitle}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button href="/contact">Get a Free Quote</Button>
              <Button href="/work" variant="secondary">
                See Our Work
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section className="border-b border-border">
        <RevealGroup className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <RevealItem key={stat.label}>
              <p className="font-display text-3xl font-semibold text-accent-text md:text-4xl">
                {stat.kind === "count" ? (
                  <CountUp
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section className="section-ink border-b border-border">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Four steps. No retainer.
          </h2>
        </Reveal>
        <div className="mt-12">
          <ProcessCards steps={process} />
        </div>
      </Section>

      <Section className="border-b border-border">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Fixed-price packages. No subscriptions, ever.
              </h2>
            </div>
            <Button href="/pricing" variant="secondary">
              See full pricing
            </Button>
          </div>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <RevealItem key={tier.name}>
              <div
                className={`h-full rounded-2xl border p-6 ${
                  tier.featured
                    ? "border-accent bg-surface"
                    : "border-border bg-surface"
                }`}
              >
                {tier.featured && (
                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent-text">
                    Most popular
                  </p>
                )}
                <p className="font-display text-lg font-medium">
                  {tier.name}
                </p>
                <p className="mt-1 text-sm text-muted">{tier.tagline}</p>
                <p className="mt-4 flex items-baseline gap-1 font-display text-2xl font-semibold">
                  {tier.price}
                  <span className="text-sm font-normal text-muted">
                    {tier.billingLabel}
                  </span>
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section className="border-b border-border">
        <Reveal>
          <Eyebrow>Proof, not promises</Eyebrow>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Real case studies from real local businesses.
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {workPreview.map((study, i) => (
            <RevealItem key={study.slug}>
              <WorkCard study={study} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <Reveal>
          <div className="rounded-3xl border border-border bg-surface px-8 py-16 text-center">
            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight md:text-4xl">
              How many jobs a month are you losing to competitors who show up
              first?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              One conversation, one fixed price, no recurring lock-in.
              Let&apos;s find out what a real website does for your booking
              rate.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href="/contact">Get a Free Quote</Button>
              <Button href="/work" variant="secondary">
                See Our Work
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
