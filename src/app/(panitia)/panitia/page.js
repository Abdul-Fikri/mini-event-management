import Link from "next/link";
import { requirePanitia } from "@/lib/auth";
import {
  EVENT_STATUS_LABELS,
  getEffectiveEventStatus,
} from "@/lib/events/status";

export const metadata = { title: "Ruang Panitia" };

export default async function PanitiaHomePage() {
  const { member, supabase } = await requirePanitia();
  const { data: assignments, error: assignmentError } = await supabase
    .from("event_members")
    .select("event_id,division,position_title,responsibility")
    .eq("member_id", member.id);

  if (assignmentError) throw new Error("Gagal memuat daftar penugasan.");

  const ids = [...new Set((assignments ?? []).map((item) => item.event_id))];
  const { data: events, error } = ids.length
    ? await supabase
        .from("events")
        .select("id,name,start_date,end_date,status,status_mode,planning_start_date,preparation_start_date,evaluation_end_date,location")
        .in("id", ids)
        .order("start_date")
    : { data: [], error: null };

  if (error) throw new Error("Gagal memuat event yang ditugaskan.");

  const assignmentByEvent = new Map(
    (assignments ?? []).map((item) => [item.event_id, item]),
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-zinc-500">Selamat datang, {member.full_name}</p>
        <h1 className="text-2xl font-semibold">Event yang ditugaskan</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Kamu hanya dapat melihat event tempat kamu terdaftar sebagai panitia.
        </p>
      </div>

      {events?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => {
            const assignment = assignmentByEvent.get(event.id);
            const status = getEffectiveEventStatus(event);
            return (
              <Link
                key={event.id}
                href={"/panitia/events/" + event.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{event.name}</h2>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">
                    {EVENT_STATUS_LABELS[status] || EVENT_STATUS_LABELS.draft}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  {assignment?.division || "Divisi belum ditentukan"}
                  {assignment?.position_title ? " · " + assignment.position_title : ""}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {event.start_date}
                  {event.end_date && event.end_date !== event.start_date
                    ? " – " + event.end_date
                    : ""}
                  {" · "}
                  {event.location || "Lokasi belum ditentukan"}
                </p>
                <p className="mt-4 text-sm font-medium text-indigo-700">
                  Buka ruang event →
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600">
          Belum ada event yang ditugaskan ke akun ini.
        </div>
      )}
    </div>
  );
}
