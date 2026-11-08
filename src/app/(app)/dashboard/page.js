import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireGroup } from "@/lib/auth";
export const metadata = { title: "Dashboard" };
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });
async function countRows(supabase, table, groupId) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("group_id", groupId);
  if (error) throw new Error(`Gagal memuat jumlah data ${table}: ${error.message}`);
  return count ?? 0;
}
function StatCard({ label, value, href }) {
  return <Link href={href} className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-indigo-300"><p className="text-sm text-zinc-600">{label}</p><p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-indigo-700">Lihat data →</p></Link>;
}
export default async function DashboardPage() {
  const { owner, group } = await requireGroup(); const supabase = await createClient();
  const [eventCount, memberCount] = await Promise.all([countRows(supabase, "events", group.id), countRows(supabase, "members", group.id)]);
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Dashboard</h1><p className="text-sm text-zinc-600">Ringkasan grup dan acara Anda.</p></div>
    <section aria-labelledby="group-heading" className="rounded-lg border border-zinc-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 id="group-heading" className="text-lg font-semibold">{group.name}</h2><p className="mt-1 text-sm text-zinc-600">{group.description ?? "Belum ada deskripsi."}</p></div>{group.category ? <span className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">{group.category}</span> : null}</div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Pemilik (Owner)</dt><dd className="font-medium">{owner.email}</dd></div><div><dt className="text-zinc-500">Grup dibuat</dt><dd className="font-medium">{dateFormatter.format(new Date(group.created_at))}</dd></div></dl></section>
    <section aria-label="Ringkasan" className="grid gap-4 sm:grid-cols-2"><StatCard label="Event" value={eventCount} href="/events"/><StatCard label="Anggota panitia" value={memberCount} href="/members"/></section>
    {eventCount === 0 ? <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center"><h2 className="font-semibold">Belum ada event</h2><p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">Mulai dengan membuat event pertama dan menambahkan anggota panitia.</p><Link href="/events/new" className="mt-3 inline-block text-sm font-medium text-indigo-700">Buat event →</Link></section> : null}
  </div>;
}
