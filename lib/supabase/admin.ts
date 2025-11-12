import { createClient } from "@supabase/supabase-js";

/**
 * Admin client with service role key for privileged operations.
 *
 * SECURITY WARNING:
 * - This client bypasses Row Level Security (RLS) policies
 * - NEVER use this client in client components or expose to browser
 * - Only use in server-side code (API routes, server actions, edge functions)
 * - Service role key grants full database access
 *
 * Use cases:
 * - Creating user accounts via Auth Admin API
 * - Administrative database operations requiring elevated privileges
 * - Background jobs and cron tasks
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Please check your environment variables."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Please check your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
