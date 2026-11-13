import Link from "next/link";
import { Pencil, MapPin } from "lucide-react";
import { getEventContext } from "@/lib/events/get-event-context";
import { EVENT_STATUS_LABELS } from "@/lib/events/status";
import EventSubnav from "@/components/events/EventSubnav";

export default async function EventLayout({ children, params }) {
  const { id } = await params;
  const { event } = await getEventContext(id);
  const statusLabel =
    EVENT_STATUS_LABELS[event.effective_status] || EVENT_STATUS_LABELS.draft;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#E3ECF5] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F83B5] transition-colors hover:text-[#32628E]"
          >
            <span aria-hidden="true">←</span>
            Semua event
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A899B]">
              Ruang kerja event
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#1E293B] sm:text-2xl">
              {event.name}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} aria-hidden="true" className="text-[#8AA5BE]" />
                {event.location || "Lokasi belum ditentukan"}
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">•</span>
              <span className="inline-flex items-center rounded-full border border-[#E7EDF3] bg-[#F8FAFC] px-2.5 py-1 font-medium text-[#64748B]">
                {statusLabel}
              </span>
              <span className="inline-flex items-center rounded-md border border-[#E0EAF3] bg-[#F2F7FB] px-2 py-1 font-medium text-[#52799C]">
                {event.status_mode === "automatic" ? "Otomatis" : "Manual"}
              </span>
            </div>
          </div>

          <Link
            href={`/events/${id}/edit`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DCE5EE] bg-white px-3.5 py-2 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] sm:text-sm"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit event
          </Link>
        </div>

        <div className="mt-5 border-t border-[#EEF2F6] pt-3">
          <EventSubnav eventId={id} />
        </div>
      </section>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
