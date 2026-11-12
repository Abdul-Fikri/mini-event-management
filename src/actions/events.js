"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { getTodayJakartaDate } from "@/lib/dates";
import { getEffectiveEventStatus } from "@/lib/events/status";
import { createClient } from "@/lib/supabase/server";
import { createEventSchema, eventFields } from "@/lib/validators/event";
import { fieldErrors, readForm } from "@/lib/validators/helpers";

const emptyState = { ok: false, message: "", errors: {}, values: {} };

export async function saveEvent(id, _prev, formData) {
  const { group } = await requireGroup();
  const values = readForm(formData, eventFields);
  const supabase = await createClient();

  let existingEvent = null;

  if (id) {
    const { data, error } = await supabase
      .from("events")
      .select("id, start_date, end_date")
      .eq("id", id)
      .eq("group_id", group.id)
      .maybeSingle();

    if (error) {
      console.error("[saveEvent:load]", error.code, error.message);
      return {
        ...emptyState,
        message: "Event gagal diperiksa. Muat ulang halaman lalu coba lagi.",
        values,
      };
    }

    if (!data) {
      return { ...emptyState, message: "Event tidak ditemukan.", values };
    }

    existingEvent = data;
  }

  const today = getTodayJakartaDate();
  const parsed = createEventSchema({
    today,
    existingEvent,
  }).safeParse(values);

  if (!parsed.success) {
    return {
      ...emptyState,
      message: "Periksa kembali isian Anda.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const payload = {
    ...parsed.data,
    group_id: group.id,
  };

  // Status otomatis selalu dihitung ulang di server; nilai hidden dari browser
  // tidak pernah menjadi sumber kebenaran untuk mode otomatis.
  if (payload.status_mode === "automatic") {
    payload.status = getEffectiveEventStatus(payload, today);
  }

  const query = id
    ? supabase
        .from("events")
        .update(payload)
        .eq("id", id)
        .eq("group_id", group.id)
        .select("id")
        .maybeSingle()
    : supabase.from("events").insert(payload).select("id").single();

  const { data, error } = await query;

  if (error || !data) {
    console.error("[saveEvent]", error?.code, error?.message);
    return {
      ...emptyState,
      message:
        error?.code === "23503"
          ? "Koordinator tidak ditemukan pada grup ini."
          : "Event gagal disimpan. Periksa data lalu coba lagi.",
      values,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");\n  revalidatePath("/events/all");
  if (id) revalidatePath(`/events/${id}`);
  redirect(id ? `/events/${id}` : "/events");
}

export async function deleteEvent(formData) {
  const { group } = await requireGroup();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("group_id", group.id);

  if (error) throw new Error("Event gagal dihapus.");

  revalidatePath("/dashboard");
  revalidatePath("/events");\n  revalidatePath("/events/all");
  revalidatePath("/members");
  redirect("/events");
}
