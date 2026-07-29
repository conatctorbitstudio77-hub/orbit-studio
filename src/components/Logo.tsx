/**
 * Orbit Studio mark: a black-hole silhouette with a tilted accretion-disk
 * ring in the brand gradient (accent orange → deep blue), plus a small
 * orbiting point. The ring is drawn full, then the sphere painted on top,
 * so the ring reads as passing both in front of and behind the hole —
 * the classic black-hole illustration trick.
 */
export function Logo({
  className = "h-8 w-8",
  detailed = true,
}: {
  className?: string;
  detailed?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orbit-ring" x1="3" y1="24" x2="45" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--deep-blue)" />
          <stop offset="50%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--deep-blue)" />
        </linearGradient>
      </defs>

      <ellipse
        cx="24"
        cy="24"
        rx="21"
        ry="7.25"
        transform="rotate(-16 24 24)"
        stroke="url(#orbit-ring)"
        strokeWidth="2.25"
      />

      <circle cx="24" cy="24" r="10" fill="var(--ink)" stroke="url(#orbit-ring)" strokeWidth="1" />

      {detailed && <circle cx="42.5" cy="19" r="1.75" fill="var(--accent)" />}
    </svg>
  );
}
