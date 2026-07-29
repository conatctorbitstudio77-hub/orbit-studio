"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Hammer, PenTool, Rocket, Search, type LucideIcon } from "lucide-react";

export type ProcessStep = {
  step: string;
  title: string;
  body: string;
  points: string[];
};

const icons: Record<string, LucideIcon> = {
  "01": Search,
  "02": PenTool,
  "03": Hammer,
  "04": Rocket,
};

/**
 * Interactive hover cards for the "How it works" section — replaces the
 * old GSAP scroll-pin/crossfade treatment (janky on trackpads and touch,
 * and hid three of the four steps behind scroll progress). Every step is
 * visible at once; hover/focus is reserved for delight, not disclosure.
 */
export function ProcessCards({ steps }: { steps: ProcessStep[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {steps.map((item, i) => {
        const Icon = icons[item.step] ?? Search;

        return (
          <motion.div
            key={item.step}
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="group relative flex cursor-default flex-col gap-5 overflow-hidden rounded-3xl border border-border bg-surface p-8 text-left transition-colors duration-300 ease-out hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/0 blur-3xl transition-all duration-500 ease-out group-hover:bg-accent/20" />

            <div className="relative flex items-center justify-between">
              <span className="font-display text-sm text-muted">
                {item.step}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:border-accent group-hover:bg-accent/10">
                <Icon className="h-5 w-5 text-accent-text transition-colors duration-300 group-hover:text-accent" />
              </div>
            </div>

            <div className="relative">
              <p className="font-display text-2xl font-semibold">
                {item.title}
              </p>
              <p className="mt-3 text-muted">{item.body}</p>
            </div>

            <ul className="relative mt-2 flex flex-col gap-2.5 border-t border-border pt-5">
              {item.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-muted transition-colors duration-300 ease-out group-hover:text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}
