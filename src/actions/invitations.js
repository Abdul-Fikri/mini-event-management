"use server";
import { randomBytes, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createMemberInvitation(_prev, formData) {
  const { group } = await requireGroup();
  const memberId = String(formData.get("member_id") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[0-9a-f-]{36}$/i.test(memberId) || !emailPattern.test(email) || email.length > 320)
    return { ok: false, message: "Masukkan email yang valid." };
  const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("id,auth_user_id")
    .eq("id", memberId).eq("group_id", group.id).maybeSingle();
  if (!member) return { ok: false, message: "Data anggota tidak ditemukan." };
  if (member.auth_user_id) return { ok: false, message: "Anggota ini sudah terhubung ke akun." };
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("member_invitations").insert({
    group_id: group.id, member_id: memberId, email, token_hash: tokenHash,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  });
  if (error) {
    console.error("[createMemberInvitation]", error.code, error.message);
    return { ok: false, message: "Undangan gagal dibuat. Pastikan migration undangan sudah diterapkan." };
  }
  revalidatePath("/members");
  return { ok: true, message: "Undangan berhasil dibuat. Kirim tautan ini kepada anggota.", link: "/join?token=" + token };
}

export async function claimMemberInvitation(formData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const token = String(formData.get("token") || "");
  if (!/^[a-f0-9]{64}$/i.test(token)) redirect("/join?error=invalid");
  const { error } = await supabase.rpc("claim_member_invitation", { p_token: token });
  if (error) {
    console.error("[claimMemberInvitation]", error.code, error.message);
    redirect("/join?error=claim");
  }
  redirect("/panitia");
}
