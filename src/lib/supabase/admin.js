import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Hanya untuk kode server. Jangan import file ini dari Client Component.
// Key privileged hanya dipakai setelah identitas Owner diverifikasi di Server Action.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Konfigurasi upload logo belum lengkap. Tambahkan SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY pada environment server."
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
