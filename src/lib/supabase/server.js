import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Klien Supabase untuk Server Component, Server Action, dan Route Handler.
// Dibuat baru untuk setiap request (jangan disimpan di variabel global).
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component: cookie tidak bisa ditulis di sini.
          // Aman diabaikan karena proxy.js yang menyegarkan sesi.
        }
      },
    },
  });
}
