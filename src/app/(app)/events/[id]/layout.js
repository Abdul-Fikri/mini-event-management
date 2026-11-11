import Link from "next/link";
import { getEventContext } from "@/lib/events/get-event-context";
import { EVENT_STATUS_LABELS } from "@/lib/events/status";
import EventSubnav from "@/components/events/EventSubnav";

export default async function EventLayout({ children, params }) {
  const { id } = await params;
  const { event } = await getEventContext(id);
  const statusLabel =
    EVENT_STATUS_LABELS[event.effective_status] || EVENT_STATUS_LABELS.draft;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/events" className="text-sm text-indigo-700 hover:underline">
          ← Semua event
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Ruang kerja event
            </p>
            <h1 className="text-2xl font-semibold">{event.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
              <span>{event.location || "Lokasi belum ditentukan"}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-zinc-800">{statusLabel}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">
                {event.status_mode === "automatic" ? "Otomatis" : "Manual"}
              </span>
            </div>
          </div>
          <Link
            href={`/events/${id}/edit`}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          >
            Edit event
          </Link>
        </div>
      </div>
      <EventSubnav eventId={id} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
