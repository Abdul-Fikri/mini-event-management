"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, readForm } from "@/lib/validators/helpers";
import { getEventReturnPath } from "@/lib/events/return-path";

const schema = z.object({
  member_id: z.string().uuid("Pilih anggota yang valid."),
  division_id: z.union([
    z.string().uuid("Pilih divisi yang valid."),
    z.literal(""),
  ]).transform((value) => value || null),
  position_title: z.string().trim().max(80, "Jabatan maksimal 80 karakter.").transform((value) => value || null),
  responsibility: z.string().trim().max(500, "Tanggung jawab maksimal 500 karakter.").transform((value) => value || null),
});

const fields = ["member_id", "division_id", "position_title", "responsibility"];
const empty = { message: "", errors: {}, values: {} };

export async function saveEventMember(eventId, assignmentId, _prev, formData) {
  const { group } = await requireGroup();
  const returnPath = getEventReturnPath(eventId, formData);
  const values = readForm(formData, fields);
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    return {
      ...empty,
      message: "Periksa kembali isian susunan panitia.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("group_id", group.id)
    .maybeSingle();

  if (!event) return { ...empty, message: "Event tidak ditemukan.", values };

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", parsed.data.member_id)
    .eq("group_id", group.id)
    .maybeSingle();

  if (!member) return { ...empty, message: "Anggota tidak ditemukan pada grup ini.", values };

  let selectedDivision = null;
  if (parsed.data.division_id) {
    const { data, error } = await supabase
      .from("event_divisions")
      .select("id, name")
      .eq("id", parsed.data.division_id)
      .eq("event_id", eventId)
      .eq("group_id", group.id)
      .maybeSingle();

    if (error || !data) {
      return {
        ...empty,
        message: "Divisi tidak ditemukan pada event ini. Muat ulang halaman lalu pilih divisi yang tersedia.",
        errors: { division_id: "Pilih divisi yang tersedia untuk event ini." },
        values,
      };
    }
    selectedDivision = data;
  }

  // Keep the legacy text label for Panitia views and CSV exports. If a
  // previously assigned division was deleted, its historical label remains
  // until the Owner explicitly selects a replacement.
  let divisionLabel = selectedDivision?.name ?? null;
  if (!selectedDivision && assignmentId) {
    const { data: previousAssignment, error: previousError } = await supabase
      .from("event_members")
      .select("division, division_id")
      .eq("id", assignmentId)
      .eq("event_id", eventId)
      .eq("group_id", group.id)
      .maybeSingle();

    if (previousError) {
      return { ...empty, message: "Data penugasan gagal diperiksa.", values };
    }
    if (previousAssignment && !previousAssignment.division_id) {
      divisionLabel = previousAssignment.division;
    }
  }

  const payload = {
    ...parsed.data,
    division_id: selectedDivision?.id ?? null,
    division: divisionLabel,
    event_id: eventId,
    group_id: group.id,
  };

  const query = assignmentId
    ? supabase.from("event_members")
        .update(payload)
        .eq("id", assignmentId)
        .eq("event_id", eventId)
        .eq("group_id", group.id)
        .select("id")
        .maybeSingle()
    : supabase.from("event_members")
        .insert(payload)
        .select("id")
        .single();

  const { data, error } = await query;
  if (error || !data) {
    console.error("[saveEventMember]", error?.code, error?.message);
    return {
      ...empty,
      message: error?.code === "23505"
        ? "Anggota ini sudah terdaftar dalam susunan panitia event."
        : "Susunan panitia gagal disimpan.",
      values,
    };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(returnPath);
  revalidatePath("/panitia");
  revalidatePath(`/panitia/events/${eventId}`);
  redirect(returnPath);
}

export async function deleteEventMember(formData) {
  const { group } = await requireGroup();
  const eventId = String(formData.get("event_id") || "");
  const assignmentId = String(formData.get("assignment_id") || "");
  if (!eventId || !assignmentId) return;

  const returnPath = getEventReturnPath(eventId, formData);
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("id", assignmentId)
    .eq("event_id", eventId)
    .eq("group_id", group.id);

  if (error) throw new Error("Anggota gagal dikeluarkan dari susunan panitia.");

  revalidatePath(`/events/${eventId}`);
  revalidatePath(returnPath);
  revalidatePath("/panitia");
  revalidatePath(`/panitia/events/${eventId}`);
  redirect(returnPath);
}
