import Link from "next/link";
import { getEventContext } from "@/lib/events/get-event-context";
import EventSubnav from "@/components/events/EventSubnav";

export default async function EventLayout({ children, params }) {
  const { id } = await params;
  const { event } = await getEventContext(id);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/events" className="text-sm text-indigo-700 hover:underline">← Semua event</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ruang kerja event</p>
            <h1 className="text-2xl font-semibold">{event.name}</h1>
            <p className="mt-1 text-sm text-zinc-600">{event.location || "Lokasi belum ditentukan"} · {event.status}</p>
          </div>
          <Link href={`/events/${id}/edit`} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">Edit event</Link>
        </div>
      </div>
      <EventSubnav eventId={id} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
