import { deleteEvent } from "@/actions/events";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { getEventContext } from "@/lib/events/get-event-context";

export const metadata = { title: "Overview Event" };
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });
const currency = value => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default async function EventOverviewPage({ params }) {
  const { id } = await params;
  const { event } = await getEventContext(id);
  const details = [
    ["Tanggal mulai", dateFmt.format(new Date(`${event.start_date}T00:00:00`))],
    ["Tanggal selesai", event.end_date ? dateFmt.format(new Date(`${event.end_date}T00:00:00`)) : "—"],
    ["Lokasi", event.location || "—"],
    ["Koordinator", event.coordinator?.full_name || "Belum ditentukan"],
    ["Target anggaran", event.target_budget == null ? "—" : currency(event.target_budget)],
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Informasi event</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label}><dt className="text-zinc-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}
        </dl>
        {event.description ? <div className="mt-5 border-t border-zinc-100 pt-4"><h3 className="text-sm font-medium">Deskripsi</h3><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{event.description}</p></div> : null}
      </section>
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Mulai kelola event</h2>
        <p className="mt-1 text-sm text-zinc-600">Gunakan navigasi di atas untuk mengatur susunan panitia, rundown, tugas, pengadaan, keuangan, dan ekspor data event ini.</p>
      </section>
      <form action={deleteEvent}><input type="hidden" name="id" value={id}/><ConfirmDeleteButton message="Hapus event ini? Rundown, tugas, transaksi, dan susunan panitia terkait dapat ikut terhapus.">Hapus event</ConfirmDeleteButton></form>
    </div>
  );
}
