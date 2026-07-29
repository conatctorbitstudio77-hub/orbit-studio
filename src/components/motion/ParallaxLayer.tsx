"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Parallax hero background — Design & Workflow Guide p.4, pattern 4.
 * Background moves slower than the scroll (subtle, ~0.5x) as the hero
 * scrolls out of view. Kept subtle per guide: "trustworthy, not flashy."
 */
export function ParallaxLayer({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className={className}>
        {children}
      </motion.div>
    </div>
  );
}
