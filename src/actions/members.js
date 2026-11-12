"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { memberFields, memberSchema } from "@/lib/validators/member";
import { fieldErrors, readForm } from "@/lib/validators/helpers";
import { getMemberReturnPath } from "@/lib/members-return-path";

const emptyState = { ok: false, message: "", errors: {}, values: {} };

export async function saveMember(id, _prev, formData) {
  const { group } = await requireGroup();
  const returnTo = getMemberReturnPath(formData.get("return_to"));
  const values = readForm(formData, memberFields);
  const parsed = memberSchema.safeParse(values);

  if (!parsed.success) {
    return { ...emptyState, message: "Periksa kembali isian Anda.", errors: fieldErrors(parsed.error), values };
  }

  const supabase = await createClient();
  const payload = { ...parsed.data, group_id: group.id };
  const query = id
    ? supabase.from("members").update(payload).eq("id", id).eq("group_id", group.id).select("id").maybeSingle()
    : supabase.from("members").insert(payload).select("id").single();
  const { data, error } = await query;

  if (error || !data) {
    console.error("[saveMember]", error?.code, error?.message);
    return { ...emptyState, message: "Anggota gagal disimpan. Periksa data lalu coba lagi.", values };
  }

  revalidatePath("/dashboard");
  revalidatePath("/members");\n  revalidatePath("/members/all");
  revalidatePath("/events");
  redirect(returnTo);
}

export async function deleteMember(formData) {
  const { group } = await requireGroup();
  const id = String(formData.get("id") || "");
  const returnTo = getMemberReturnPath(formData.get("return_to"));
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", id).eq("group_id", group.id);
  if (error) throw new Error("Anggota gagal dihapus.");

  revalidatePath("/dashboard");
  revalidatePath("/members");\n  revalidatePath("/members/all");
  revalidatePath("/events");
  redirect(returnTo);
}
