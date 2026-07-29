"use client";

import { Children, cloneElement, isValidElement, type ReactElement } from "react";
import { Reveal } from "./Reveal";

/**
 * Staggered card grids — Design & Workflow Guide p.4, pattern 2.
 * Wrap a grid in <RevealGroup>, each child in <RevealItem> — children
 * animate in sequence (~80ms apart) instead of simultaneously.
 *
 * Implemented as per-item whileInView with an injected delay (rather
 * than Framer Motion's variants-propagation) — more robust across
 * nesting depth and React 19 strict-mode remounts.
 */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<{ delay?: number }>, {
              delay: index * 0.08,
            })
          : child
      )}
    </div>
  );
}

export function RevealItem({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal className={className} delay={delay}>
      {children}
    </Reveal>
  );
}
