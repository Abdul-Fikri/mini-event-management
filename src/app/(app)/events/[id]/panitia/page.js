import { getEventContext } from "@/lib/events/get-event-context";
import EventDivisionManager from "@/components/events/EventDivisionManager";
import EventCommitteeList from "@/components/events/EventCommitteeList";
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
  const availableCount = selectable.filter((member) => !member.assigned).length;

  return (
    <div className="space-y-5 rounded-2xl bg-[#F5F8FC] p-3 sm:p-4">
      <EventDivisionManager eventId={id} divisions={divisions ?? []} />

      <section className="overflow-hidden rounded-2xl border border-[#E2EBF5] bg-white shadow-[0_4px_14px_rgba(148,163,184,0.08)]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2EBF5] bg-gradient-to-r from-[#F8FBFF] via-white to-white px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">STRUKTUR TIM EVENT</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">Susunan panitia</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
              Atur anggota yang bertugas, divisi, jabatan, dan tanggung jawab masing-masing.
            </p>
          </div>
          <span className="rounded-full border border-[#DCEAF8] bg-[#EBF3FC] px-3 py-1.5 text-sm font-semibold text-[#1D4ED8]">
            {committee.length} anggota terdaftar
          </span>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <EventCommitteeList
            eventId={id}
            committee={committee}
            members={selectable}
            divisions={divisions ?? []}
          />

          {availableCount > 0 ? (
            <section className="rounded-2xl border border-[#DCEAF8] bg-[#F5F9FE] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">TAMBAH ANGGOTA</p>
                  <h3 className="mt-1 text-lg font-bold text-[#0F172A]">Tambahkan anggota ke event</h3>
                  <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    Pilih anggota grup yang belum ditugaskan, lalu lengkapi divisi dan tanggung jawabnya.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] shadow-sm ring-1 ring-[#DCEAF8]">
                  {availableCount} tersedia
                </span>
              </div>
              <div className="mt-4">
                <EventMemberForm eventId={id} members={selectable} divisions={divisions ?? []} />
              </div>
            </section>
          ) : (members ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C8DDF2] bg-[#F8FBFF] p-5">
              <p className="font-semibold text-[#334155]">Belum ada anggota grup.</p>
              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                Tambahkan data anggota melalui menu Anggota Panitia terlebih dahulu, lalu kembali ke halaman ini untuk menyusun kepanitiaan.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#DCEAF8] bg-[#F8FBFF] px-4 py-3">
              <p className="text-sm font-medium text-[#475569]">
                Semua anggota grup sudah masuk dalam susunan panitia event ini.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
