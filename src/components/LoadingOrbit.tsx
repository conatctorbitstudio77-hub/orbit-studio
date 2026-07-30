/**
 * Branded loading indicator — the orbit ring actually spins around the
 * sphere (pure CSS animation, no JS/Framer Motion dependency, so it
 * starts animating immediately in the server-rendered HTML). Used as
 * the fallback for route-level Suspense boundaries (see loading.tsx
 * files) while a page's server-side data fetch is in flight.
 */
export function LoadingOrbit({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <defs>
        <linearGradient id="loading-orbit-ring" x1="3" y1="24" x2="45" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--deep-blue)" />
          <stop offset="50%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--deep-blue)" />
        </linearGradient>
      </defs>

      <g className="animate-[spin_1.4s_linear_infinite]" style={{ transformOrigin: "24px 24px" }}>
        <ellipse
          cx="24"
          cy="24"
          rx="21"
          ry="7.25"
          transform="rotate(-16 24 24)"
          stroke="url(#loading-orbit-ring)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="55 40"
        />
      </g>

      <circle cx="24" cy="24" r="10" fill="var(--ink)" stroke="url(#loading-orbit-ring)" strokeWidth="1" />
    </svg>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24">
      <LoadingOrbit className="h-12 w-12" />
      <p className="text-xs font-medium uppercase tracking-widest text-muted">Loading</p>
    </div>
  );
}
