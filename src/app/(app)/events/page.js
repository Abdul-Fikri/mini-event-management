import Link from "next/link";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveEventStatus } from "@/lib/events/status";
import EventList from "@/components/events/EventList";

export const metadata = { title: "Event" };

export default async function EventsPage() {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,category,start_date,end_date,location,status,status_mode,planning_start_date,preparation_start_date,evaluation_end_date")
    .eq("group_id", group.id)
    .order("start_date", { ascending: false });

  if (error) throw new Error("Gagal memuat daftar event.");
  const rows = (events ?? []).map((event) => ({
    ...event,
    effectiveStatus: getEffectiveEventStatus(event),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Event</h1><p className="text-sm text-zinc-600">Kelola seluruh acara grup.</p></div>
        <Link href="/events/new" className="rounded-xl bg-[#407BB0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#32628E]">+ Buat event</Link>
      </div>
      <EventList events={rows} />
    </div>
  );
}
