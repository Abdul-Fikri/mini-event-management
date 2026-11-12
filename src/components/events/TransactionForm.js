"use client";
import { useActionState } from "react";
import { saveTransaction } from "@/actions/finance";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { MoneyField } from "@/components/ui/MoneyField";

const initial = { message: "", errors: {}, values: {} };
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
export default function TransactionForm({ eventId, categories, members, transaction = null, returnTo = `/events/${eventId}/keuangan` }) {
  const [state, action, pending] = useActionState(saveTransaction.bind(null, eventId, transaction?.id ?? null), initial);
  const value = key => state.values?.[key] ?? (transaction?.[key] ?? "");
  return <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
    <input type="hidden" name="return_to" value={returnTo}/>
    {state.message ? <Alert>{state.message}</Alert> : null}
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label htmlFor={"trx-type-" + (transaction?.id ?? "new")} className="mb-1 block text-sm font-medium">Jenis transaksi</label><select id={"trx-type-" + (transaction?.id ?? "new")} name="type" defaultValue={value("type") || "expense"} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></div>
      <TextField id={"trx-date-" + (transaction?.id ?? "new")} name="trx_date" label="Tanggal" type="date" defaultValue={value("trx_date") || today} error={state.errors?.trx_date} required/>
    </div>
    <TextField id={"trx-desc-" + (transaction?.id ?? "new")} name="description" label="Deskripsi transaksi" defaultValue={value("description")} error={state.errors?.description} required/>
    <MoneyField id={"trx-amount-" + (transaction?.id ?? "new")} name="amount" label="Nominal (Rp)" defaultValue={value("amount")} hint="Pemisah ribuan ditambahkan otomatis, contoh: 500.000." error={state.errors?.amount} required/>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label htmlFor={"trx-category-" + (transaction?.id ?? "new")} className="mb-1 block text-sm font-medium">Kategori anggaran</label><select id={"trx-category-" + (transaction?.id ?? "new")} name="category_id" defaultValue={value("category_id")} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Tanpa kategori</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{state.errors?.category_id ? <p className="mt-1 text-sm text-red-700">{state.errors.category_id}</p> : null}</div>
      <div><label htmlFor={"trx-recorder-" + (transaction?.id ?? "new")} className="mb-1 block text-sm font-medium">Dicatat oleh</label><select id={"trx-recorder-" + (transaction?.id ?? "new")} name="recorded_by" defaultValue={value("recorded_by")} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Tidak ditentukan</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select>{state.errors?.recorded_by ? <p className="mt-1 text-sm text-red-700">{state.errors.recorded_by}</p> : null}</div>
    </div>
    <TextField id={"trx-ref-" + (transaction?.id ?? "new")} name="reference" label="Referensi / nomor bukti (opsional)" defaultValue={value("reference")} error={state.errors?.reference}/>
    <Button type="submit" pending={pending} pendingText="Menyimpan…">{transaction ? "Simpan transaksi" : "Tambah transaksi"}</Button>
  </form>;
}
