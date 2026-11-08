const options = [
  ["members", "Data anggota"],
  ["committee", "Susunan panitia"],
  ["schedule", "Rundown acara"],
  ["tasks", "Daftar tugas"],
  ["procurement", "Pengadaan / perlengkapan"],
  ["finance", "Transaksi keuangan"],
];
export default function EventExportSection({ eventId }) {
  return <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5">
    <div><h2 className="text-lg font-semibold">Ekspor data event</h2><p className="text-sm text-zinc-600">Unduh data event dalam format CSV yang bisa dibuka di Excel, Google Sheets, atau aplikasi spreadsheet lainnya.</p></div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map(([type, label]) => <a key={type} href={"/api/events/" + eventId + "/export/" + type} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50"><span>{label}</span><span aria-hidden="true">↓ CSV</span></a>)}
    </div>
    <p className="text-xs text-zinc-500">Setiap kategori diunduh sebagai file CSV terpisah. Data hanya dapat diunduh oleh Owner grup yang memiliki event tersebut.</p>
  </section>;
}
