import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses Row Level Security entirely. The
 * `server-only` import makes any accidental client-bundle import a
 * build error rather than a leaked secret.
 *
 * Scope this narrowly: it exists so the public /api/quote route can
 * write to the quotes table (which has zero public RLS access) without
 * a logged-in session. Admin pages should prefer lib/supabase/server.ts
 * so reads/writes happen as the authenticated admin, not as a
 * service-role bypass.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
