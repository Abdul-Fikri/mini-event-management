"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { memberFields, memberSchema } from "@/lib/validators/member";
import { fieldErrors, readForm } from "@/lib/validators/helpers";
import { getMemberReturnPath } from "@/lib/members-return-path";

const emptyState = { ok: false, message: "", errors: {}, values: {} };
const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export async function saveMember(id, _prev, formData) {
  const { group } = await requireGroup();
  const returnTo = getMemberReturnPath(formData.get("return_to"));
  const values = { ...readForm(formData, memberFields), account_email: String(formData.get("account_email") || "").trim().toLowerCase() };
  const parsed = memberSchema.safeParse(values);
  const accountEmail = String(formData.get("account_email") || "").trim().toLowerCase();
  const accountPassword = String(formData.get("account_password") || "");
  const accountPasswordConfirm = String(formData.get("account_password_confirm") || "");

  if (!parsed.success) {
    return { ...emptyState, message: "Periksa kembali isian Anda.", errors: fieldErrors(parsed.error), values };
  }

  if (!emailPattern.test(accountEmail) || accountEmail.length > 320) {
    return { ...emptyState, message: "Masukkan email akun yang valid.", errors: { account_email: "Email akun wajib diisi dengan format yang valid." }, values };
  }

  const supabase = await createClient();
  let existing = null;
  if (id) {
    const { data, error } = await supabase
      .from("members")
      .select("id,full_name,contact,auth_user_id,account_email")
      .eq("id", id)
      .eq("group_id", group.id)
      .maybeSingle();
    if (error || !data) return { ...emptyState, message: "Anggota tidak ditemukan pada grup ini.", values };
    existing = data;
  }

  const needsAccount = !existing?.auth_user_id;
  if ((needsAccount && accountPassword.length < 8) || (!needsAccount && accountPassword && accountPassword.length < 8)) {
    return {
      ...emptyState,
      message: needsAccount ? "Password awal minimal 8 karakter untuk membuat akun." : "Password baru minimal 8 karakter.",
      errors: { account_password: "Gunakan minimal 8 karakter." },
      values,
    };
  }

  if ((needsAccount || accountPassword) && accountPassword !== accountPasswordConfirm) {
    return {
      ...emptyState,
      message: "Password dan konfirmasi password belum sama.",
      errors: { account_password_confirm: "Konfirmasi harus sama dengan password." },
      values,
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    console.error("[saveMember] Admin client configuration is missing.");
    return { ...emptyState, message: "Pengaturan server untuk membuat akun belum lengkap. Tambahkan SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY di environment server.", values };
  }

  let authUserId = existing?.auth_user_id ?? null;
  let createdAuthUserId = null;

  if (needsAccount) {
    const { data, error } = await admin.auth.admin.createUser({
      email: accountEmail,
      password: accountPassword,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.full_name, role: "panitia" },
    });
    if (error || !data?.user) {
      console.error("[saveMember] create auth user:", error?.code, error?.message);
      return { ...emptyState, message: error?.message?.toLowerCase().includes("already") ? "Email ini sudah digunakan akun lain." : "Akun Panitia gagal dibuat. Periksa email dan coba lagi.", values };
    }
    authUserId = data.user.id;
    createdAuthUserId = data.user.id;
  }

  const payload = {
    ...parsed.data,
    group_id: group.id,
    auth_user_id: authUserId,
    account_email: accountEmail,
  };

  if (existing) {
    const { error } = await supabase.from("members").update(payload).eq("id", id).eq("group_id", group.id);
    if (error) {
      if (createdAuthUserId) await admin.auth.admin.deleteUser(createdAuthUserId);
      console.error("[saveMember] member update:", error.code, error.message);
      return { ...emptyState, message: "Data anggota gagal disimpan.", values };
    }
  } else {
    const { error } = await supabase.from("members").insert(payload);
    if (error) {
      if (createdAuthUserId) await admin.auth.admin.deleteUser(createdAuthUserId);
      console.error("[saveMember] member insert:", error.code, error.message);
      return { ...emptyState, message: "Data anggota gagal disimpan. Akun yang baru dibuat telah dibatalkan.", values };
    }
  }

  if (!needsAccount) {
    const authPayload = { email: accountEmail, email_confirm: true };
    if (accountPassword) authPayload.password = accountPassword;
    const { error } = await admin.auth.admin.updateUserById(authUserId, authPayload);
    if (error) {
      console.error("[saveMember] auth update:", error.code, error.message);
      await supabase.from("members").update({ account_email: existing.account_email }).eq("id", id).eq("group_id", group.id);
      return { ...emptyState, message: "Data panitia tersimpan, tetapi perubahan akun gagal. Periksa email atau password lalu coba lagi.", values };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/members/all");
  revalidatePath("/events");
  redirect(returnTo);
}

export async function deleteMember(formData) {
  const { group } = await requireGroup();
  const id = String(formData.get("id") || "");
  const returnTo = getMemberReturnPath(formData.get("return_to"));
  if (!id) return;

  const supabase = await createClient();
  const { data: member, error: lookupError } = await supabase
    .from("members")
    .select("id,auth_user_id")
    .eq("id", id)
    .eq("group_id", group.id)
    .maybeSingle();

  if (lookupError || !member) throw new Error("Anggota tidak ditemukan pada grup ini.");

  if (member.auth_user_id) {
    let admin;
    try {
      admin = createAdminClient();
    } catch {
      throw new Error("Konfigurasi server akun belum lengkap; anggota dan akun tidak dihapus.");
    }
    const { error: authError } = await admin.auth.admin.deleteUser(member.auth_user_id);
    if (authError) {
      console.error("[deleteMember] auth delete:", authError.code, authError.message);
      throw new Error("Akun Panitia gagal dihapus; data anggota tetap dipertahankan.");
    }
  }

  const { error } = await supabase.from("members").delete().eq("id", id).eq("group_id", group.id);
  if (error) throw new Error("Akun telah diproses, tetapi data anggota gagal dihapus.");

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/members/all");
  revalidatePath("/events");
  redirect(returnTo);
}
