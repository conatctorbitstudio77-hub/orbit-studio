import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client — uses the public anon key, safe to ship to the client.
 * Respects Row Level Security as whoever is currently logged in (or as
 * anon, if no one is).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
