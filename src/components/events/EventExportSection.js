const options = [
  ["members", "Data anggota"],
  ["committee", "Susunan panitia"],
  ["schedule", "Rundown acara"],
  ["tasks", "Daftar tugas"],
  ["procurement", "Pengadaan / perlengkapan"],
  ["finance", "Transaksi keuangan"],
];
export default function EventExportSection({ eventId }) {
  return <section className="management-panel space-y-5 p-5 sm:p-6">
    <div><h2 className="text-lg font-semibold">Ekspor data event</h2><p className="text-sm text-zinc-600">Unduh data event dalam format CSV yang bisa dibuka di Excel, Google Sheets, atau aplikasi spreadsheet lainnya.</p></div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map(([type, label]) => <a key={type} href={"/api/events/" + eventId + "/export/" + type} className="management-card flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-[#407BB0] hover:bg-[#F8FAFC]"><span>{label}</span><span aria-hidden="true">↓ CSV</span></a>)}
    </div>
    <p className="text-xs text-zinc-500">Setiap kategori diunduh sebagai file CSV terpisah. Data hanya dapat diunduh oleh Owner grup yang memiliki event tersebut.</p>
  </section>;
}
