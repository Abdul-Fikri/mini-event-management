import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent } from "@/actions/events";
import { deleteEventMember } from "@/actions/event-members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import EventMemberForm from "@/components/events/EventMemberForm";
import ScheduleSection from "@/components/events/ScheduleSection";
import TaskSection from "@/components/events/TaskSection";
import ProcurementSection from "@/components/events/ProcurementSection";
import FinanceSection from "@/components/events/FinanceSection";
import EventExportSection from "@/components/events/EventExportSection";

export const metadata = { title: "Detail Event" };
const labels = { draft:"Draf", planned:"Direncanakan", ongoing:"Berlangsung", completed:"Selesai", cancelled:"Dibatalkan" };
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle:"long", timeZone:"Asia/Jakarta" });
export default async function EventDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { group } = await requireGroup();
  const supabase = await createClient();
  const [{ data: event }, { data: assignments }, { data: members }, { data: schedule }, { data: tasks }, { data: procurementItems }, { data: budgetCategories }, { data: transactions }] = await Promise.all([
    supabase.from("events").select("*, coordinator:members(full_name)").eq("id",id).eq("group_id",group.id).maybeSingle(),
    supabase.from("event_members").select("id,member_id,division,position_title,responsibility").eq("event_id",id).eq("group_id",group.id).order("created_at"),
    supabase.from("members").select("id,full_name,contact").eq("group_id",group.id).order("full_name"),
    supabase.from("schedule_items").select("*").eq("event_id",id).eq("group_id",group.id).order("item_date").order("start_time").order("sort_order"),
    supabase.from("tasks").select("*").eq("event_id",id).eq("group_id",group.id).order("due_date").order("created_at"),
    supabase.from("procurement_items").select("*").eq("event_id",id).eq("group_id",group.id).order("created_at"),
    supabase.from("budget_categories").select("*").eq("event_id",id).eq("group_id",group.id).order("name"),
    supabase.from("transactions").select("*").eq("event_id",id).eq("group_id",group.id).order("trx_date",{ascending:false}).order("created_at",{ascending:false}),
  ]);
  if (!event) notFound();
  const memberById = new Map((members ?? []).map(m => [m.id,m]));
  const committee = (assignments ?? []).map(a => ({...a, member:memberById.get(a.member_id)}));
  const assignedIds = new Set(committee.map(a=>a.member_id));
  const selectableMembers = (members ?? []).map(m=>({...m,assigned:assignedIds.has(m.id)}));
  return <div className="space-y-5">
    <div><Link href="/events" className="text-sm text-indigo-700">← Kembali ke event</Link><div className="mt-2 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold">{event.name}</h1><p className="mt-1 text-sm text-zinc-600">{labels[event.status]}{event.category ? ` · ${event.category}` : ""}</p></div><Link href={`/events/${id}/edit`} className="rounded-md border border-zinc-300 px-4 py-2 text-sm">Edit event</Link></div></div>
    <section className="rounded-lg border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Informasi event</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">{[["Tanggal mulai",dateFmt.format(new Date(`${event.start_date}T00:00:00`))],["Tanggal selesai",event.end_date ? dateFmt.format(new Date(`${event.end_date}T00:00:00`)) : "—"],["Lokasi",event.location || "—"],["Koordinator",event.coordinator?.full_name || "Belum ditentukan"],["Target anggaran",event.target_budget == null ? "—" : new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(event.target_budget)]].map(([k,v])=><div key={k}><dt className="text-zinc-500">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}</dl>{event.description ? <div className="mt-5 border-t border-zinc-100 pt-4"><h3 className="text-sm font-medium">Deskripsi</h3><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{event.description}</p></div> : null}</section>

    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
      <div><h2 className="text-lg font-semibold">Susunan panitia</h2><p className="text-sm text-zinc-600">Atur divisi, jabatan, dan tanggung jawab anggota untuk event ini.</p></div>
      {committee.length ? <div className="space-y-3">{committee.map(a=><article key={a.id} className="rounded-lg border border-zinc-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{a.member?.full_name ?? "Anggota tidak ditemukan"}</h3><p className="text-sm text-zinc-600">{[a.division,a.position_title].filter(Boolean).join(" · ") || "Divisi dan jabatan belum ditentukan"}</p>{a.member?.contact ? <p className="mt-1 text-xs text-zinc-500">{a.member.contact}</p> : null}{a.responsibility ? <p className="mt-2 whitespace-pre-wrap text-sm">{a.responsibility}</p> : null}</div><form action={deleteEventMember}><input type="hidden" name="event_id" value={id}/><input type="hidden" name="assignment_id" value={a.id}/><ConfirmDeleteButton message={`Keluarkan ${a.member?.full_name ?? "anggota"} dari susunan panitia event ini?`}>Keluarkan</ConfirmDeleteButton></form></div><details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit penugasan</summary><div className="mt-3"><EventMemberForm eventId={id} members={selectableMembers} assignment={a}/></div></details></article>)}</div> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada anggota dalam susunan panitia event ini.</p>}
      {selectableMembers.some(m=>!m.assigned) ? <div className="border-t border-zinc-100 pt-4"><h3 className="mb-3 font-medium">Tambah anggota</h3><EventMemberForm eventId={id} members={selectableMembers}/></div> : (members ?? []).length === 0 ? <p className="text-sm text-zinc-600">Tambahkan data anggota grup terlebih dahulu melalui menu Anggota Panitia.</p> : <p className="text-sm text-zinc-500">Semua anggota grup sudah masuk dalam susunan panitia event ini.</p>}
    </section>
    <ScheduleSection eventId={id} eventStartDate={event.start_date} schedule={schedule ?? []} members={members ?? []}/>
    <TaskSection eventId={id} tasks={tasks ?? []} members={members ?? []}/>
    <ProcurementSection eventId={id} items={procurementItems ?? []} members={members ?? []}/>
    <FinanceSection eventId={id} targetBudget={event.target_budget} categories={budgetCategories ?? []} transactions={transactions ?? []} members={members ?? []} financeError={query?.finance_error ?? ""}/>
    <EventExportSection eventId={id}/>
    <form action={deleteEvent}><input type="hidden" name="id" value={id}/><ConfirmDeleteButton message="Hapus event ini? Rundown, tugas, transaksi, dan susunan panitia terkait dapat ikut terhapus.">Hapus event</ConfirmDeleteButton></form>
  </div>;
}
