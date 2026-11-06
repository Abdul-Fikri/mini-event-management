import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Pemilik (Owner) yang sedang login, atau null.
// Memakai getClaims() (validasi token), bukan getSession().
// cache() menghindari pemeriksaan ganda dalam satu request.
export const getCurrentOwner = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email ?? "" };
});

// Grup milik Owner (maksimal satu), atau null jika belum onboarding.
// RLS memastikan hanya baris milik Owner yang bisa terbaca.
export const getOwnerGroup = cache(async () => {
  const owner = await getCurrentOwner();
  if (!owner) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, description, category, created_at")
    .eq("owner_id", owner.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat grup: ${error.message}`);
  }
  return data;
});

// Gunakan di halaman/aksi yang butuh login.
export async function requireOwner() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/login");
  return owner;
}

// Gunakan di halaman aplikasi: butuh login DAN sudah punya grup.
// Setiap halaman memanggil ini sendiri (jangan mengandalkan layout saja).
export async function requireGroup() {
  const owner = await requireOwner();
  const group = await getOwnerGroup();
  if (!group) redirect("/onboarding");
  return { owner, group };
}
