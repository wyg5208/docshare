import { createClient } from "@supabase/supabase-js";

/**
 * Admin client - bypasses RLS using secret key (or legacy service_role key).
 * Only use in server-side code (API routes, Server Actions).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    // Support new secret key with fallback to legacy service_role key
    process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "placeholder-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
