import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePanitia } from "@/lib/auth";
export const metadata = { title: "Detail Event Panitia" };
const procurementStatusLabel = { not_started: "Belum dimulai", requested: "Diminta", ordered: "Dipesan", purchased: "Sudah dibeli", ready: "Siap digunakan", not_needed: "Tidak diperlukan" };
export default async function PanitiaEventPage({ params }) {
  const { id } = await params;
  const { member, supabase } = await requirePanitia();
  const { data: assignment } = await supabase.from("event_members").select("division,position_title,responsibility")
    .eq("event_id", id).eq("member_id", member.id).maybeSingle();
  if (!assignment) notFound();
  const { data: event } = await supabase.from("events").select("id,name,description,start_date,end_date,location,status")
    .eq("id", id).maybeSingle();
  if (!event) notFound();
  const [{ data: schedule }, { data: tasks }, { data: procurement }] = await Promise.all([
    supabase.from("schedule_items").select("id,title,item_date,start_time,end_time,location,notes").eq("event_id", id).order("item_date").order("start_time"),
    supabase.from("tasks").select("id,title,due_date,status,priority,description").eq("event_id", id).order("due_date"),
    supabase.from("procurement_items").select("id,name,quantity,unit,status").eq("event_id", id).order("created_at"),
  ]);
  return <div className="space-y-5">
    <Link href="/panitia" className="text-sm text-indigo-700">← Event yang ditugaskan</Link>
    <section className="rounded-lg border border-zinc-200 bg-white p-5"><p className="text-xs uppercase tracking-wide text-zinc-500">Ruang kerja event</p><h1 className="mt-1 text-2xl font-semibold">{event.name}</h1><p className="mt-2 text-sm text-zinc-600">{event.start_date}{event.end_date ? " – " + event.end_date : ""} · {event.location || "Lokasi belum ditentukan"}</p><p className="mt-3 text-sm font-medium">{assignment.division || "Panitia"}{assignment.position_title ? " · " + assignment.position_title : ""}</p>{assignment.responsibility ? <p className="mt-1 text-sm text-zinc-600">{assignment.responsibility}</p> : null}</section>
    <section className="rounded-lg border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Rundown</h2>{schedule?.length ? <ul className="mt-3 divide-y divide-zinc-100">{schedule.map((item) => <li key={item.id} className="py-3"><p className="font-medium">{item.title}</p><p className="text-xs text-zinc-500">{item.item_date} · {item.start_time || "Waktu belum diatur"}{item.end_time ? " – " + item.end_time : ""} · {item.location || "Lokasi belum ditentukan"}</p>{item.notes ? <p className="mt-1 text-sm text-zinc-600">{item.notes}</p> : null}</li>)}</ul> : <p className="mt-2 text-sm text-zinc-500">Belum ada item rundown.</p>}</section>
    <section className="rounded-lg border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Tugas</h2>{tasks?.length ? <ul className="mt-3 divide-y divide-zinc-100">{tasks.map((task) => <li key={task.id} className="py-3"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{task.title}</p><span className="text-xs text-zinc-500">{task.status} · {task.priority}</span></div>{task.due_date ? <p className="text-xs text-zinc-500">Deadline: {task.due_date}</p> : null}{task.description ? <p className="mt-1 text-sm text-zinc-600">{task.description}</p> : null}</li>)}</ul> : <p className="mt-2 text-sm text-zinc-500">Belum ada tugas.</p>}</section>
    <section className="rounded-lg border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Pengadaan</h2>{procurement?.length ? <ul className="mt-3 divide-y divide-zinc-100">{procurement.map((item) => <li key={item.id} className="flex justify-between gap-3 py-3"><span className="font-medium">{item.name} <span className="font-normal text-zinc-500">· {item.quantity} {item.unit || ""}</span></span><span className="text-xs text-zinc-500">{procurementStatusLabel[item.status] || item.status}</span></li>)}</ul> : <p className="mt-2 text-sm text-zinc-500">Belum ada data pengadaan.</p>}</section>
  </div>;
}
