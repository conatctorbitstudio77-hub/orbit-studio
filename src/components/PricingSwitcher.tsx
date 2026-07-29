"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Tier } from "@/lib/site";

export function PricingSwitcher({
  oneTime,
  monthly,
}: {
  oneTime: Tier[];
  monthly: Tier[];
}) {
  const [billing, setBilling] = useState<"one-time" | "monthly">("one-time");
  const tiers = billing === "one-time" ? oneTime : monthly;

  return (
    <div>
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {(["one-time", "monthly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBilling(option)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                billing === option
                  ? "bg-ink text-warm-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {option === "one-time" ? "One-Time" : "Monthly"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          {billing === "one-time"
            ? "Pay once, own it forever — no subscription required."
            : "Optional plans on top of any site — cancel anytime."}
        </p>
      </div>

      <div className="relative mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={billing}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="contents"
          >
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex h-full flex-col rounded-2xl border p-8 ${
                  tier.featured
                    ? "border-accent bg-surface"
                    : "border-border bg-surface"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                    <Star className="h-3 w-3 fill-current" />
                    Most popular
                  </span>
                )}

                <p className="font-display text-xl font-medium">{tier.name}</p>
                <p className="mt-1 text-sm text-muted">{tier.tagline}</p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted">{tier.billingLabel}</span>
                </p>
                <p className="mt-1 text-xs text-muted">{tier.bestFor}</p>

                <GetStartedButton featured={tier.featured} />

                <ul className="mt-8 flex-1 space-y-3 border-t border-border pt-6">
                  <li className="text-xs font-medium uppercase tracking-widest text-muted">
                    What&apos;s included
                  </li>
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted">
                      <span className="text-accent">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function GetStartedButton({ featured }: { featured?: boolean }) {
  const base =
    "group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 ease-out active:scale-95";
  const styles = featured
    ? "bg-accent text-ink hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/40"
    : "border border-border text-foreground hover:-translate-y-0.5 hover:scale-[1.03] hover:border-accent hover:text-accent-text hover:shadow-md";

  return (
    <Link href="/contact" className={`${base} ${styles}`}>
      Get Started
      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </Link>
  );
}
