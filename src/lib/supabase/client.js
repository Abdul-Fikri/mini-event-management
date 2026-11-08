import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Klien Supabase untuk Client Component (browser).
// Hanya memakai Publishable Key; keamanan data tetap dijaga oleh RLS.
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
