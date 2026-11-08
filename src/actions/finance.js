"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { budgetCategoryFields, budgetCategorySchema, transactionFields, transactionSchema } from "@/lib/validators/finance";
import { fieldErrors, readForm } from "@/lib/validators/helpers";

const empty = { message: "", errors: {}, values: {} };
const path = eventId => "/events/" + eventId;

async function ownedEvent(supabase, eventId, groupId) {
  const { data } = await supabase.from("events").select("id").eq("id", eventId).eq("group_id", groupId).maybeSingle();
  return data;
}

export async function saveBudgetCategory(eventId, categoryId, _prev, formData) {
  const { group } = await requireGroup();
  const values = readForm(formData, budgetCategoryFields);
  const parsed = budgetCategorySchema.safeParse(values);
  if (!parsed.success) return { ...empty, message: "Periksa kembali kategori anggaran.", errors: fieldErrors(parsed.error), values };
  const supabase = await createClient();
  if (!await ownedEvent(supabase, eventId, group.id)) return { ...empty, message: "Event tidak ditemukan.", values };
  const payload = { ...parsed.data, group_id: group.id, event_id: eventId };
  const query = categoryId
    ? supabase.from("budget_categories").update(payload).eq("id", categoryId).eq("event_id", eventId).eq("group_id", group.id).select("id").maybeSingle()
    : supabase.from("budget_categories").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error || !data) {
    const message = error?.code === "23505" ? "Nama kategori tersebut sudah digunakan pada event ini." : "Kategori anggaran gagal disimpan.";
    return { ...empty, message, values };
  }
  revalidatePath(path(eventId));
  redirect(path(eventId));
}

export async function deleteBudgetCategory(formData) {
  const { group } = await requireGroup();
  const eventId = String(formData.get("event_id") || "");
  const categoryId = String(formData.get("category_id") || "");
  if (!eventId || !categoryId) return;
  const supabase = await createClient();
  const { error } = await supabase.from("budget_categories").delete().eq("id", categoryId).eq("event_id", eventId).eq("group_id", group.id);
  if (error) {
    if (error.code === "23503") redirect(path(eventId) + "?finance_error=category_in_use");
    throw new Error("Kategori anggaran gagal dihapus.");
  }
  revalidatePath(path(eventId));
  redirect(path(eventId));
}

export async function saveTransaction(eventId, transactionId, _prev, formData) {
  const { group } = await requireGroup();
  const values = readForm(formData, transactionFields);
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return { ...empty, message: "Periksa kembali data transaksi.", errors: fieldErrors(parsed.error), values };
  const supabase = await createClient();
  if (!await ownedEvent(supabase, eventId, group.id)) return { ...empty, message: "Event tidak ditemukan.", values };
  if (parsed.data.category_id) {
    const { data: category } = await supabase.from("budget_categories").select("id").eq("id", parsed.data.category_id).eq("event_id", eventId).eq("group_id", group.id).maybeSingle();
    if (!category) return { ...empty, message: "Kategori tidak valid untuk event ini.", values };
  }
  if (parsed.data.recorded_by) {
    const { data: member } = await supabase.from("members").select("id").eq("id", parsed.data.recorded_by).eq("group_id", group.id).maybeSingle();
    if (!member) return { ...empty, message: "Pencatat transaksi tidak ditemukan pada grup ini.", values };
  }
  const payload = { ...parsed.data, group_id: group.id, event_id: eventId };
  const query = transactionId
    ? supabase.from("transactions").update(payload).eq("id", transactionId).eq("event_id", eventId).eq("group_id", group.id).select("id").maybeSingle()
    : supabase.from("transactions").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error || !data) return { ...empty, message: "Transaksi gagal disimpan. Periksa kembali datanya.", values };
  revalidatePath(path(eventId));
  redirect(path(eventId));
}

export async function deleteTransaction(formData) {
  const { group } = await requireGroup();
  const eventId = String(formData.get("event_id") || "");
  const transactionId = String(formData.get("transaction_id") || "");
  if (!eventId || !transactionId) return;
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", transactionId).eq("event_id", eventId).eq("group_id", group.id);
  if (error) throw new Error("Transaksi gagal dihapus.");
  revalidatePath(path(eventId));
  redirect(path(eventId));
}
