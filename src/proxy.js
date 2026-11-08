import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: proxy.js menggantikan middleware.js.
// Tugasnya: menyegarkan sesi Supabase dan mengalihkan pengguna belum login ke /login.
// Catatan: Server Action tetap memeriksa sesi sendiri (lihat src/lib/auth.js dan src/actions).
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Semua path kecuali file statis dan gambar.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
