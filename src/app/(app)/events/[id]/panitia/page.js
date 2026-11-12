import { getEventContext } from "@/lib/events/get-event-context";
import { deleteEventMember } from "@/actions/event-members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import EventDivisionManager from "@/components/events/EventDivisionManager";
import EventMemberForm from "@/components/events/EventMemberForm";

export const metadata = { title: "Panitia Event" };

export default async function EventCommitteePage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);

  const [
    { data: assignments, error: assignmentError },
    { data: members, error: memberError },
    { data: divisions, error: divisionError },
  ] = await Promise.all([
    supabase
      .from("event_members")
      .select("id,member_id,division_id,division,position_title,responsibility")
      .eq("event_id", id)
      .eq("group_id", group.id)
      .order("created_at"),
    supabase
      .from("members")
      .select("id,full_name,contact")
      .eq("group_id", group.id)
      .order("full_name"),
    supabase
      .from("event_divisions")
      .select("id,name,description")
      .eq("event_id", id)
      .eq("group_id", group.id)
      .order("name"),
  ]);

  if (assignmentError || memberError || divisionError) {
    throw new Error("Gagal memuat data susunan panitia dan divisi event.");
  }

  const divisionById = new Map((divisions ?? []).map((division) => [division.id, division.name]));
  const memberById = new Map((members ?? []).map((member) => [member.id, member]));
  const committee = (assignments ?? []).map((item) => ({
    ...item,
    division: divisionById.get(item.division_id) ?? item.division,
    member: memberById.get(item.member_id),
  }));
  const assigned = new Set(committee.map((item) => item.member_id));
  const selectable = (members ?? []).map((member) => ({
    ...member,
    assigned: assigned.has(member.id),
  }));

  return (
    <div className="space-y-4">
      <EventDivisionManager eventId={id} divisions={divisions ?? []} />

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Susunan panitia</h2>
          <p className="text-sm text-zinc-600">
            Tambahkan anggota grup ke event, lalu tentukan divisi, jabatan, dan tanggung jawabnya.
          </p>
        </div>

        {committee.length ? committee.map((item) => (
          <article key={item.id} className="rounded-lg border border-zinc-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.member?.full_name ?? "Anggota tidak ditemukan"}</h3>
                <p className="text-sm text-zinc-600">
                  {[item.division, item.position_title].filter(Boolean).join(" · ") || "Divisi dan jabatan belum ditentukan"}
                </p>
                {item.member?.contact ? (
                  <p className="mt-1 text-xs text-zinc-500">{item.member.contact}</p>
                ) : null}
                {item.responsibility ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm">{item.responsibility}</p>
                ) : null}
              </div>

              <form action={deleteEventMember}>
                <input type="hidden" name="event_id" value={id} />
                <input type="hidden" name="return_to" value={`/events/${id}/panitia`} />
                <input type="hidden" name="assignment_id" value={item.id} />
                <ConfirmDeleteButton message={`Keluarkan ${item.member?.full_name ?? "anggota"} dari susunan panitia event ini?`}>
                  Keluarkan
                </ConfirmDeleteButton>
              </form>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit penugasan</summary>
              <div className="mt-3">
                <EventMemberForm
                  eventId={id}
                  members={selectable}
                  divisions={divisions ?? []}
                  assignment={item}
                />
              </div>
            </details>
          </article>
        )) : (
          <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
            Belum ada anggota dalam susunan panitia event ini.
          </p>
        )}

        {selectable.some((member) => !member.assigned) ? (
          <div className="border-t border-zinc-100 pt-4">
            <h3 className="mb-3 font-medium">Tambah anggota</h3>
            <EventMemberForm eventId={id} members={selectable} divisions={divisions ?? []} />
          </div>
        ) : (members ?? []).length === 0 ? (
          <p className="text-sm text-zinc-600">
            Tambahkan data anggota grup melalui menu Anggota Panitia terlebih dahulu.
          </p>
        ) : (
          <p className="text-sm text-zinc-500">Semua anggota grup sudah masuk dalam susunan panitia event ini.</p>
        )}
      </section>
    </div>
  );
}
