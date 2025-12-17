import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client with service role key
 * This bypasses Row Level Security (RLS) policies
 * Only use for trusted server-side operations
 * 
 * IMPORTANT: Uses @supabase/supabase-js NOT @supabase/ssr
 * The SSR package doesn't properly bypass RLS even with service role
 */
export function createServiceRoleClient() {
  return createClient(
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
