"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

const thumbnailGradients = [
  "bg-linear-to-br from-accent to-deep-blue",
  "bg-linear-to-br from-deep-blue to-ink",
  "bg-linear-to-br from-ink via-deep-blue to-accent",
];

export type WorkCardData = {
  slug: string;
  title: string;
  industry: string;
  badge: string;
  summary: string;
  thumbnailUrl?: string | null;
  websiteUrl?: string | null;
};

/**
 * "Our Work" card — Design & Workflow Guide p.6. Gradient placeholder
 * thumbnail when there's no real image yet (never a fake screenshot);
 * once a case study has a real thumbnail_url, that renders instead.
 * Summary is clamped with a Read more/less toggle to keep card height
 * consistent, and a Visit site link opens the live project when set.
 */
export function WorkCard({
  study,
  index = 0,
}: {
  study: WorkCardData;
  index?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      {study.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URLs, arbitrary domains
        <img
          src={study.thumbnailUrl}
          alt={study.title}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-36 items-center justify-center ${thumbnailGradients[index % thumbnailGradients.length]}`}
        >
          <span className="text-xs font-medium uppercase tracking-widest text-warm-white/80">
            Project Preview
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-accent-text">
          {study.industry} · {study.badge}
        </p>
        <p className="mt-3 font-display text-lg font-medium">{study.title}</p>
        <p className={`mt-2 flex-1 text-sm text-muted ${expanded ? "" : "line-clamp-3"}`}>
          {study.summary}
        </p>
        {study.summary.length > 140 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 self-start text-sm font-medium text-accent-text hover:underline"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
        {study.websiteUrl && (
          <a
            href={study.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent-text"
          >
            Visit site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
