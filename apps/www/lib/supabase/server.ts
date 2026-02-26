import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client that bypasses RLS.
 * Only use server-side (API routes / Server Actions).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
