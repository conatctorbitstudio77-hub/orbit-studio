"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Tags used by 'use cache' reads in lib/supabase/content.ts and the
 * public marketing pages — keep in sync with the cacheTag() calls there. */
const CONTENT_TAGS = [
  "site-settings",
  "pricing-tiers",
  "faqs",
  "case-studies",
  "blog-posts",
] as const;

export type ContentTag = (typeof CONTENT_TAGS)[number];

/**
 * Called from the admin dashboard right after a Supabase write succeeds,
 * so the public pages show the change on the very next request instead of
 * waiting for the cache to expire. Requires an authenticated admin session
 * — the dashboard itself is already gated by proxy.ts, but this is a
 * Server Action reachable directly, so it re-checks rather than trusting
 * the caller.
 */
export async function revalidateContent(tags: ContentTag[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  for (const tag of tags) {
    if (CONTENT_TAGS.includes(tag)) updateTag(tag);
  }
}
