// Membaca konfigurasi Supabase dari environment variable.
// Nilai asli ada di .env.local (tidak di-commit). Jangan menulis kunci di kode.
//
// Catatan: process.env.NEXT_PUBLIC_* harus ditulis persis seperti di bawah
// (bukan lewat variabel/dinamis) agar Next.js bisa menyertakannya di bundle browser.
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan .env.local berisi " +
        "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, " +
        "lalu restart `npm run dev`."
    );
  }

  return { url, key };
}
