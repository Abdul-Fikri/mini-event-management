import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireGroup } from "@/lib/auth";

// Dashboard privat: selalu dirender dinamis agar data Supabase per pengguna tidak di-cache lintas sesi.\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Dashboard" };

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const currency = value => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value ?? 0);
const statusLabel = { draft: "Draf", planned: "Direncanakan", ongoing: "Berlangsung", completed: "Selesai", cancelled: "Dibatalkan" };

function StatCard({ label, value, detail, href, tone = "default" }) {
  return <Link href={href} className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm">
    <p className="text-sm text-zinc-600">{label}</p>
    <p className={"mt-2 text-2xl font-semibold tabular-nums " + (tone === "warning" ? "text-amber-700" : tone === "success" ? "text-emerald-700" : "")}>{value}</p>
    <p className="mt-1 text-xs text-zinc-500">{detail}</p>
  </Link>;
}

function SectionHeading({ title, href, linkLabel }) {
  return <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><Link href={href} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">{linkLabel} →</Link></div>;
}

export default async function DashboardPage() {
  const { owner, group } = await requireGroup();
  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

  const [
    { data: events, error: eventsError },
    { count: memberCount, error: membersError },
    { data: tasks, error: tasksError },
    { data: transactions, error: transactionsError },
    { data: categories, error: categoriesError },
    { data: procurement, error: procurementError },
  ] = await Promise.all([
    supabase.from("events").select("id,name,start_date,end_date,status,location,target_budget").eq("group_id", group.id).order("start_date", { ascending: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("group_id", group.id),
    supabase.from("tasks").select("id,event_id,title,due_date,status,priority").eq("group_id", group.id),
    supabase.from("transactions").select("type,amount").eq("group_id", group.id),
    supabase.from("budget_categories").select("planned_amount").eq("group_id", group.id),
    supabase.from("procurement_items").select("id,status").eq("group_id", group.id),
  ]);

  const errors = [eventsError, membersError, tasksError, transactionsError, categoriesError, procurementError].filter(Boolean);
  if (errors.length) {
    console.error("[dashboard]", errors.map(error => error.message));
    throw new Error("Gagal memuat ringkasan dashboard. Coba muat ulang halaman.");
  }

  const eventRows = events ?? [];
  const taskRows = tasks ?? [];
  const transactionRows = transactions ?? [];
  const categoryRows = categories ?? [];
  const procurementRows = procurement ?? [];
  const eventCount = eventRows.length;
  const ongoingCount = eventRows.filter(event => event.status === "ongoing").length;
  const plannedCount = eventRows.filter(event => event.status === "planned" || event.status === "draft").length;
  const upcoming = eventRows.filter(event => event.start_date >= today && !["completed", "cancelled"].includes(event.status)).slice(0, 5);
  const overdueTasks = taskRows.filter(task => task.due_date && task.due_date < today && task.status !== "done");
  const openTasks = taskRows.filter(task => task.status !== "done");
  const income = transactionRows.filter(item => item.type === "income").reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = transactionRows.filter(item => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
  const plannedBudget = categoryRows.reduce((sum, item) => sum + Number(item.planned_amount), 0);
  const pendingProcurement = procurementRows.filter(item => ["not_started", "requested"].includes(item.status)).length;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-sm text-zinc-500">Ringkasan aktivitas grup</p><h1 className="text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-zinc-600">Halo, Owner. Berikut gambaran kondisi event dan pekerjaan grup saat ini.</p></div>
      <Link href="/events/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">+ Buat event</Link>
    </div>

    <section aria-labelledby="group-heading" className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Grup aktif</p><h2 id="group-heading" className="mt-1 text-lg font-semibold">{group.name}</h2><p className="mt-1 text-sm text-zinc-600">{group.description ?? "Belum ada deskripsi grup."}</p></div>
        {group.category ? <span className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">{group.category}</span> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500"><span>Owner: <strong className="font-medium text-zinc-700">{owner.email}</strong></span><span>{memberCount ?? 0} anggota terdaftar</span></div>
    </section>

    <section aria-label="Ringkasan event dan pekerjaan" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total event" value={eventCount} detail={ongoingCount + " berlangsung · " + plannedCount + " direncanakan / draf"} href="/events"/>
      <StatCard label="Tugas belum selesai" value={openTasks.length} detail={overdueTasks.length + " melewati deadline"} href="/events" tone={overdueTasks.length ? "warning" : "default"}/>
      <StatCard label="Pengadaan tertunda" value={pendingProcurement} detail="Belum dimulai atau diminta" href="/events"/>
      <StatCard label="Anggota panitia" value={memberCount ?? 0} detail="Anggota dalam grup" href="/members"/>
    </section>

    <section className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-4"><p className="text-sm text-zinc-500">Total pemasukan tercatat</p><p className="mt-1 text-xl font-semibold text-emerald-700">{currency(income)}</p></div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4"><p className="text-sm text-zinc-500">Total pengeluaran tercatat</p><p className="mt-1 text-xl font-semibold">{currency(expense)}</p></div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4"><p className="text-sm text-zinc-500">Saldo kas seluruh event</p><p className={"mt-1 text-xl font-semibold " + (income - expense < 0 ? "text-red-700" : "text-zinc-900")}>{currency(income - expense)}</p><p className="mt-1 text-xs text-zinc-500">Pemasukan dikurangi pengeluaran</p></div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4"><p className="text-sm text-zinc-500">Total rencana anggaran kategori</p><p className="mt-1 text-xl font-semibold">{currency(plannedBudget)}</p><p className="mt-1 text-xs text-zinc-500">Akumulasi seluruh event</p></div>
    </section>

    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <SectionHeading title="Event mendatang" href="/events" linkLabel="Semua event"/>
      {upcoming.length ? <div className="mt-3 divide-y divide-zinc-100">{upcoming.map(event => <Link key={event.id} href={"/events/" + event.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-1 hover:text-indigo-800"><div className="min-w-0"><p className="font-medium">{event.name}</p><p className="mt-1 text-xs text-zinc-500">{event.location || "Lokasi belum ditentukan"} · {statusLabel[event.status]}</p></div><div className="shrink-0 text-right"><p className="text-sm font-medium">{dateFormatter.format(new Date(event.start_date + "T00:00:00"))}</p>{event.end_date && event.end_date !== event.start_date ? <p className="text-xs text-zinc-500">s.d. {dateFormatter.format(new Date(event.end_date + "T00:00:00"))}</p> : null}</div></Link>)}</div> : <div className="mt-3 rounded-md border border-dashed border-zinc-300 p-5 text-center"><p className="text-sm text-zinc-600">{eventCount ? "Tidak ada event mendatang yang aktif." : "Belum ada event di grup ini."}</p><Link href="/events/new" className="mt-2 inline-block text-sm font-medium text-indigo-700">Buat event →</Link></div>}
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <SectionHeading title="Pantauan tugas" href="/events" linkLabel="Kelola tugas"/>
        <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Belum selesai</p><p className="mt-1 text-2xl font-semibold">{openTasks.length}</p></div><div className="rounded-md bg-amber-50 p-3"><p className="text-xs text-amber-800">Terlambat</p><p className="mt-1 text-2xl font-semibold text-amber-800">{overdueTasks.length}</p></div></div>
        {overdueTasks.length ? <div className="mt-3 space-y-2">{overdueTasks.slice(0, 3).map(task => { const event = eventRows.find(item => item.id === task.event_id); return <Link key={task.id} href={"/events/" + task.event_id} className="block rounded-md border border-amber-100 p-3 hover:bg-amber-50"><p className="text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-zinc-500">{event?.name ?? "Event"} · Deadline {dateFormatter.format(new Date(task.due_date + "T00:00:00"))}</p></Link>; })}</div> : <p className="mt-3 text-sm text-zinc-500">Tidak ada tugas yang melewati deadline. Mantap!</p>}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <SectionHeading title="Status event" href="/events" linkLabel="Lihat daftar"/>
        <div className="mt-4 space-y-3">{Object.entries(statusLabel).map(([status, label]) => { const count = eventRows.filter(event => event.status === status).length; const percent = eventCount ? (count / eventCount) * 100 : 0; return <div key={status}><div className="mb-1 flex justify-between text-sm"><span className="text-zinc-600">{label}</span><strong className="tabular-nums">{count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: percent + "%" }}/></div></div>; })}</div>
      </div>
    </section>
  </div>;
}
