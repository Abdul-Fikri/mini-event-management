import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent } from "@/actions/events";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
export const metadata = { title: "Detail Event" };
const labels = { draft:"Draf", planned:"Direncanakan", ongoing:"Berlangsung", completed:"Selesai", cancelled:"Dibatalkan" };
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle:"long", timeZone:"Asia/Jakarta" });
export default async function EventDetailPage({ params }) {
  const { id } = await params; const { group } = await requireGroup(); const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*, coordinator:members(full_name)").eq("id", id).eq("group_id", group.id).maybeSingle();
  if (!event) notFound();
  return <div className="space-y-5"><div><Link href="/events" className="text-sm text-indigo-700">← Kembali ke event</Link><div className="mt-2 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold">{event.name}</h1><p className="mt-1 text-sm text-zinc-600">{labels[event.status]}{event.category ? ` · ${event.category}` : ""}</p></div><Link href={`/events/${id}/edit`} className="rounded-md border border-zinc-300 px-4 py-2 text-sm">Edit event</Link></div></div>
    <section className="rounded-lg border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Informasi event</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">{[["Tanggal mulai",dateFmt.format(new Date(`${event.start_date}T00:00:00`))],["Tanggal selesai",event.end_date ? dateFmt.format(new Date(`${event.end_date}T00:00:00`)) : "—"],["Lokasi",event.location || "—"],["Koordinator",event.coordinator?.full_name || "Belum ditentukan"],["Target anggaran",event.target_budget == null ? "—" : new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(event.target_budget)]].map(([k,v]) => <div key={k}><dt className="text-zinc-500">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}</dl>{event.description ? <div className="mt-5 border-t border-zinc-100 pt-4"><h3 className="text-sm font-medium">Deskripsi</h3><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{event.description}</p></div> : null}</section>
    <form action={deleteEvent}><input type="hidden" name="id" value={id}/><ConfirmDeleteButton message="Hapus event ini? Rundown, tugas, dan transaksi terkait dapat ikut terhapus sesuai relasi database.">Hapus event</ConfirmDeleteButton></form>
  </div>;
}
