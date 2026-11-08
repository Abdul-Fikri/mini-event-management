import Link from "next/link";
import { getEventContext } from "@/lib/events/get-event-context";

const sections = [
  { href: "", label: "Overview" },
  { href: "/panitia", label: "Panitia" },
  { href: "/rundown", label: "Rundown" },
  { href: "/tugas", label: "Tugas" },
  { href: "/pengadaan", label: "Pengadaan" },
  { href: "/keuangan", label: "Keuangan" },
  { href: "/ekspor", label: "Ekspor" },
];

export default async function EventLayout({ children, params }) {
  const { id } = await params;
  const { event } = await getEventContext(id);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/events" className="text-sm text-indigo-700 hover:underline">← Semua event</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ruang kerja event</p>
            <h1 className="text-2xl font-semibold">{event.name}</h1>
            <p className="mt-1 text-sm text-zinc-600">{event.location || "Lokasi belum ditentukan"} · {event.status}</p>
          </div>
          <Link href={`/events/${id}/edit`} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">Edit event</Link>
        </div>
      </div>
      <nav aria-label="Navigasi event" className="-mx-1 flex gap-1 overflow-x-auto border-b border-zinc-200 px-1">
        {sections.map((item) => (
          <Link key={item.href} href={`/events/${id}${item.href}`} className="shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-zinc-600 hover:border-indigo-400 hover:text-indigo-800">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
