import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveEventStatus } from "@/lib/events/status";
import EventList from "@/components/events/EventList";

export const metadata = { title: "Semua Event" };

export default async function AllEventsPage() {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,category,start_date,end_date,location,status,status_mode,planning_start_date,preparation_start_date,evaluation_end_date")
    .eq("group_id", group.id)
    .order("start_date", { ascending: false });

  if (error) throw new Error("Gagal memuat seluruh event.");
  const rows = (events ?? []).map((event) => ({
    ...event,
    effectiveStatus: getEffectiveEventStatus(event),
  }));

  return <EventList events={rows} standalone />;
}
