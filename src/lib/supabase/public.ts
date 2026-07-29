import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client for public Server Components (e.g. /work, /blog)
 * fetching published content. Deliberately doesn't touch cookies() —
 * pulling in lib/supabase/server.ts's cookie-aware client here would
 * force those pages into fully dynamic rendering for no reason, since
 * public reads don't depend on who's logged in. RLS already scopes
 * anon access to published = true rows.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
