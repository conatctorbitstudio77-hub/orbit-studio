import "server-only";
import type { NextRequest } from "next/server";

/**
 * Best-effort per-instance rate limiter. Fluid Compute reuses function
 * instances across requests so this catches real-world abuse in practice,
 * but it isn't shared across instances/regions — if this site ever sees
 * serious spam despite it, move the counter to Upstash Redis instead of
 * tightening this further.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bound memory use — evict the oldest entries if this grows unreasonably
// large (e.g. under a distributed-IP flood).
const MAX_TRACKED_KEYS = 5000;

export function getClientIp(request: Request | NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/** Returns true if the request is allowed, false if it should be rejected (429). */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count += 1;
  return true;
}
