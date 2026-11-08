import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const getCurrentOwner = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email ?? "" };
});
export const getOwnerGroup = cache(async () => {
  const owner = await getCurrentOwner();
  if (!owner) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("groups").select("id,name,description,category,created_at,logo_url").eq("owner_id", owner.id).maybeSingle();
  if (error) throw new Error(`Gagal memuat grup: ${error.message}`);
  return data;
});
export async function requireOwner() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/login");
  return owner;
}
export async function requireGroup() {
  const owner = await requireOwner();
  const group = await getOwnerGroup();
  if (!group) {
    const panitia = await getCurrentPanitia();
    if (panitia) redirect("/panitia");
    redirect("/onboarding");
  }
  return { owner, group };
}
export const getCurrentPanitia = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const { data: member, error } = await supabase.from("members").select("id,group_id,full_name,contact").eq("auth_user_id", userId).maybeSingle();
  if (error) throw new Error("Gagal memeriksa akses Panitia.");
  return member;
});
export async function requirePanitia() {
  const member = await getCurrentPanitia();
  if (!member) redirect("/login");
  return { member, supabase: await createClient() };
}
