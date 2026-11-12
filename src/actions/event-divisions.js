"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEventReturnPath } from "@/lib/events/return-path";
import { fieldErrors, readForm } from "@/lib/validators/helpers";

const schema = z.object({
  name: z.string().trim().min(1, "Nama divisi wajib diisi.").max(80, "Nama divisi maksimal 80 karakter."),
  description: z.string().trim().max(250, "Deskripsi maksimal 250 karakter.").transform((value) => value || null),
});
const fields = ["name", "description"];
const empty = { message: "", errors: {}, values: {} };

async function verifyEvent(supabase, eventId, groupId) {
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("group_id", groupId)
    .maybeSingle();
  return !error && data;
}

function refreshDivisionPaths(eventId) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/panitia`);
  revalidatePath(`/events/${eventId}/panitia/divisions`);
  revalidatePath(`/events/${eventId}/panitia/committee`);
  revalidatePath("/panitia");
  revalidatePath(`/panitia/events/${eventId}`);
}

export async function saveEventDivision(eventId, divisionId, _prev, formData) {
  const { group } = await requireGroup();
  const returnPath = getEventReturnPath(eventId, formData);
  const values = readForm(formData, fields);
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    return {
      ...empty,
      message: "Periksa kembali data divisi.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  if (!await verifyEvent(supabase, eventId, group.id)) {
    return { ...empty, message: "Event tidak ditemukan.", values };
  }

  const payload = {
    ...parsed.data,
    event_id: eventId,
    group_id: group.id,
  };
  const query = divisionId
    ? supabase.from("event_divisions")
        .update(payload)
        .eq("id", divisionId)
        .eq("event_id", eventId)
        .eq("group_id", group.id)
        .select("id")
        .maybeSingle()
    : supabase.from("event_divisions")
        .insert(payload)
        .select("id")
        .single();

  const { data, error } = await query;
  if (error || !data) {
    console.error("[saveEventDivision]", error?.code, error?.message);
    return {
      ...empty,
      message: error?.code === "23505"
        ? "Nama divisi tersebut sudah digunakan pada event ini."
        : "Divisi gagal disimpan. Periksa kembali lalu coba lagi.",
      values,
    };
  }

  refreshDivisionPaths(eventId);
  revalidatePath(returnPath);
  redirect(returnPath);
}

export async function deleteEventDivision(eventId, divisionId, _prev, formData) {
  const { group } = await requireGroup();
  const returnPath = getEventReturnPath(eventId, formData);
  const supabase = await createClient();

  if (!await verifyEvent(supabase, eventId, group.id)) {
    return { ...empty, message: "Event tidak ditemukan." };
  }

  const { data, error } = await supabase
    .from("event_divisions")
    .delete()
    .eq("id", divisionId)
    .eq("event_id", eventId)
    .eq("group_id", group.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[deleteEventDivision]", error.code, error.message);
    return { ...empty, message: "Divisi gagal dihapus. Coba muat ulang halaman." };
  }
  if (!data) return { ...empty, message: "Divisi tidak ditemukan." };

  refreshDivisionPaths(eventId);
  revalidatePath(returnPath);
  redirect(returnPath);
}
