"use client";

import { useEffect, useState } from "react";
import { LoadingOrbit } from "@/components/LoadingOrbit";

/**
 * The admin dashboard server-renders fully on every request (force-dynamic,
 * no streaming) and then hydrates ~7 separate client component trees. In
 * that gap, every button is visually present but its onClick isn't wired up
 * yet — a click there is silently swallowed (no error, no network request).
 * This dims the page and blocks pointer events until hydration completes,
 * so a click either lands on a working button or doesn't land at all.
 */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  return (
    <div className="relative">
      <div className={ready ? "" : "pointer-events-none select-none opacity-60"}>{children}</div>
      {!ready && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/40">
          <div className="flex flex-col items-center gap-2 border border-border bg-surface px-6 py-4 shadow-lg">
            <LoadingOrbit className="h-8 w-8" />
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              Preparing dashboard…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
