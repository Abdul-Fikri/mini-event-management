import Link from "next/link";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EVENT_STATUS_LABELS, getEffectiveEventStatus } from "@/lib/events/status";

export const metadata = { title: "Event" };
const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export default async function EventsPage() {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,category,start_date,end_date,location,status,status_mode,planning_start_date,preparation_start_date,evaluation_end_date")
    .eq("group_id", group.id)
    .order("start_date", { ascending: false });

  if (error) throw new Error("Gagal memuat daftar event.");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Event</h1>
          <p className="text-sm text-zinc-600">Kelola seluruh acara grup.</p>
        </div>
        <Link
          href="/events/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Buat event
        </Link>
      </div>

      {events.length ? (
        <div className="grid gap-3">
          {events.map((event) => {
            const status = getEffectiveEventStatus(event);
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-indigo-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{event.name}</h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      {event.category || "Tanpa kategori"}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">
                    {EVENT_STATUS_LABELS[status] || EVENT_STATUS_LABELS.draft}
                  </span>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  {dateFmt.format(new Date(`${event.start_date}T00:00:00`))}
                  {event.end_date
                    ? ` – ${dateFmt.format(new Date(`${event.end_date}T00:00:00`))}`
                    : ""}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
          <h2 className="font-semibold">Belum ada event</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Buat event pertama untuk mulai mengelola acara grup.
          </p>
          <Link
            href="/events/new"
            className="mt-4 inline-block text-sm font-medium text-indigo-700"
          >
            Buat event pertama →
          </Link>
        </div>
      )}
    </div>
  );
}
