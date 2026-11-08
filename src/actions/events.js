"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { eventFields, eventSchema } from "@/lib/validators/event";
import { fieldErrors, readForm } from "@/lib/validators/helpers";
const emptyState = { ok: false, message: "", errors: {}, values: {} };
export async function saveEvent(id, _prev, formData) {
  const { group } = await requireGroup();
  const values = readForm(formData, eventFields);
  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) return { ...emptyState, message: "Periksa kembali isian Anda.", errors: fieldErrors(parsed.error), values };
  const supabase = await createClient();
  const payload = { ...parsed.data, group_id: group.id };
  const query = id
    ? supabase.from("events").update(payload).eq("id", id).eq("group_id", group.id).select("id").maybeSingle()
    : supabase.from("events").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error || !data) {
    console.error("[saveEvent]", error?.code, error?.message);
    return { ...emptyState, message: error?.code === "23503" ? "Koordinator tidak ditemukan pada grup ini." : "Event gagal disimpan. Periksa data lalu coba lagi.", values };
  }
  revalidatePath("/dashboard"); revalidatePath("/events");
  redirect(id ? `/events/${id}` : "/events");
}
export async function deleteEvent(formData) {
  const { group } = await requireGroup();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id).eq("group_id", group.id);
  if (error) throw new Error("Event gagal dihapus.");
  revalidatePath("/dashboard"); revalidatePath("/events"); revalidatePath("/members");
  redirect("/events");
}
