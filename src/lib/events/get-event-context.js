import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getEventContext(eventId) {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*, coordinator:members(full_name)")
    .eq("id", eventId)
    .eq("group_id", group.id)
    .maybeSingle();

  if (error) throw new Error("Gagal memuat data event.");
  if (!event) notFound();

  return { event, group, supabase };
}
