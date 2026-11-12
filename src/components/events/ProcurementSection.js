"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProcurementItem, syncProcurementItemToFinance } from "@/actions/procurement";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import ProcurementForm from "@/components/events/ProcurementForm";
import { Alert } from "@/components/ui/Alert";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;
const currency = (value) => value == null ? "—" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const statusLabel = { not_started: "Belum dimulai", requested: "Diminta", ordered: "Dipesan", purchased: "Sudah dibeli", ready: "Siap digunakan", not_needed: "Tidak diperlukan" };
const dateFmt = (value) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value + "T00:00:00")) : "—";

export default function ProcurementSection({ eventId, items, members, categories, linkedProcurementIds = [], procurementError = "", standalone = false }) {
  const [page, setPage] = useState(1);
  const memberById = new Map(members.map((member) => [member.id, member]));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const linkedIds = new Set(linkedProcurementIds);
  const active = items.filter((item) => item.status !== "not_needed");
  const estimate = active.reduce((sum, item) => sum + (item.est_unit_price ?? 0) * Number(item.quantity), 0);
  const commitment = active.filter((item) => item.status === "ordered").reduce((sum, item) => sum + (item.est_unit_price ?? 0) * Number(item.quantity), 0);
  const actual = active.filter((item) => ["purchased", "ready"].includes(item.status)).reduce((sum, item) => sum + (item.actual_unit_price ?? 0) * Number(item.quantity), 0);
  const count = { not_started: 0, requested: 0, ordered: 0, purchased: 0, ready: 0, not_needed: 0 };
  items.forEach((item) => { count[item.status] = (count[item.status] ?? 0) + 1; });
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleItems = items.slice(startIndex, startIndex + PAGE_SIZE);
  const basePath = `/events/${eventId}/pengadaan`;
  const returnTo = standalone ? `${basePath}/all` : basePath;

  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {standalone ? <Link href={basePath} className="text-sm font-medium text-indigo-700 hover:underline">← Kembali ke Pengadaan</Link> : null}
          <h2 className={standalone ? "mt-2 text-xl font-semibold" : "text-lg font-semibold"}>{standalone ? "Semua kebutuhan pengadaan" : "Manajemen perlengkapan"}</h2>
          <p className="text-sm text-zinc-600">Kelola kebutuhan dan progres pembelian. Item berstatus Dipesan menjadi komitmen anggaran; item Sudah dibeli otomatis masuk ke pengeluaran Keuangan.</p>
        </div>
        {!standalone && items.length > 0 ? (
          <Link href={`${basePath}/all`} className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100">Lihat semua pengadaan</Link>
        ) : null}
      </div>

      {procurementError === "missing_actual_price" ? <Alert>Isi harga aktual lebih dari Rp0 sebelum mencatat pembelian ke Keuangan.</Alert> : null}
      {procurementError === "missing_purchase_date" ? <Alert>Isi tanggal pembelian yang sebenarnya pada form Edit kebutuhan, lalu klik Catat ke Keuangan. Sistem tidak menebak tanggal untuk data pengadaan lama.</Alert> : null}
      {procurementError === "sync_failed" ? <Alert>Pengadaan belum berhasil disinkronkan. Pastikan migration integrasi Pengadaan–Keuangan sudah diterapkan, lalu coba lagi.</Alert> : null}
      {procurementError === "item_not_found" ? <Alert>Item pengadaan tidak ditemukan.</Alert> : null}
      {procurementError === "not_purchased" ? <Alert>Hanya item berstatus Sudah dibeli atau Siap digunakan yang dapat dicatat sebagai pengeluaran.</Alert> : null}

      {!standalone ? (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total estimasi kebutuhan</p><p className="mt-1 text-lg font-semibold">{currency(estimate)}</p></div>
            <div className="rounded-md bg-amber-50 p-3"><p className="text-xs text-amber-800">Komitmen (status Dipesan)</p><p className="mt-1 text-lg font-semibold">{currency(commitment)}</p></div>
            <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Pengeluaran pembelian</p><p className="mt-1 text-lg font-semibold">{currency(actual)}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(statusLabel).map(([key, label]) => <div key={key} className="rounded-md border border-zinc-100 p-2"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{count[key]}</p></div>)}
          </div>
        </>
      ) : null}

      {items.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, items.length)} dari {items.length} kebutuhan.</p>
          <div className="space-y-3">
            {visibleItems.map((item) => {
              const isPurchased = ["purchased", "ready"].includes(item.status);
              const isLinked = linkedIds.has(item.id);
              return (
                <article key={item.id} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">{statusLabel[item.status]}</span>
                        {item.status === "ordered" ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">Komitmen anggaran</span> : null}
                        {isPurchased ? <span className={`rounded-full px-2 py-0.5 text-xs ${isLinked ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{isLinked ? "Tercatat di Keuangan" : "Belum terhubung ke Keuangan"}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{Number(item.quantity)} {item.unit ?? "unit"} · {categoryById.get(item.category_id)?.name ?? "Tanpa kategori"}</p>
                      {item.specification ? <p className="mt-1 text-sm text-zinc-600">{item.specification}</p> : null}
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="text-zinc-500">Estimasi total</dt><dd className="font-medium">{currency(item.est_unit_price == null ? null : Number(item.est_unit_price) * Number(item.quantity))}</dd></div>
                        <div><dt className="text-zinc-500">Aktual total</dt><dd className="font-medium">{currency(item.actual_unit_price == null ? null : Number(item.actual_unit_price) * Number(item.quantity))}</dd></div>
                        <div><dt className="text-zinc-500">PIC</dt><dd>{memberById.get(item.pic_member_id)?.full_name ?? "Belum ditentukan"}</dd></div>
                        <div><dt className="text-zinc-500">Supplier</dt><dd>{item.supplier ?? "—"}</dd></div>
                        <div><dt className="text-zinc-500">Tanggal pembelian</dt><dd>{dateFmt(item.purchased_date)}</dd></div>
                      </dl>
                      {item.notes ? <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-500">Catatan: {item.notes}</p> : null}
                      {item.status === "ordered" ? <Link className="mt-2 inline-block text-xs font-medium text-indigo-700 hover:underline" href={`/events/${eventId}/keuangan`}>Lihat komitmen di Keuangan →</Link> : null}
                      {isPurchased && isLinked ? <Link className="mt-2 inline-block text-xs font-medium text-indigo-700 hover:underline" href={`/events/${eventId}/keuangan`}>Lihat transaksi di Keuangan →</Link> : null}
                      {isPurchased && !isLinked ? (
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                          <p className="text-sm text-amber-900">Item pembelian ini belum terhubung ke transaksi Keuangan. Jika ini data lama, pastikan pembeliannya belum pernah dicatat manual agar tidak terjadi pencatatan ganda.</p>
                          <form action={syncProcurementItemToFinance} className="mt-2">
                            <input type="hidden" name="event_id" value={eventId} />
                            <input type="hidden" name="item_id" value={item.id} />
                            <input type="hidden" name="return_to" value={returnTo} />
                            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Catat ke Keuangan</button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                    <form action={deleteProcurementItem}>
                      <input type="hidden" name="event_id" value={eventId} />
                      <input type="hidden" name="return_to" value={returnTo} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <ConfirmDeleteButton message={`Hapus kebutuhan "${item.name}"? Jika sudah dibeli, transaksi pengeluarannya akan tetap tersimpan di Keuangan.`}>Hapus</ConfirmDeleteButton>
                    </form>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit kebutuhan / perbarui status</summary>
                    <div className="mt-3"><ProcurementForm eventId={eventId} members={members} categories={categories} item={item} returnTo={returnTo} /></div>
                  </details>
                </article>
              );
            })}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kebutuhan perlengkapan untuk event ini.</p>
      )}

      {!standalone ? (
        <div className="border-t border-zinc-100 pt-4">
          <h3 className="mb-3 font-medium">Tambah kebutuhan</h3>
          <ProcurementForm eventId={eventId} members={members} categories={categories} returnTo={returnTo} />
        </div>
      ) : null}
    </section>
  );
}
