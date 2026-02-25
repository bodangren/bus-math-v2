import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Supabase client will not be initialized.");
    return null as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
