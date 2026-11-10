import { deleteBudgetCategory, deleteTransaction } from "@/actions/finance";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Alert } from "@/components/ui/Alert";
import BudgetCategoryForm from "@/components/events/BudgetCategoryForm";
import TransactionForm from "@/components/events/TransactionForm";

const currency = value => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));
const dateFmt = value => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value + "T00:00:00"));
export default function FinanceSection({ eventId, targetBudget, categories, transactions, members, financeError = "" }) {
  const income = transactions.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount), 0);
  const planned = categories.reduce((s,c) => s + Number(c.planned_amount), 0);
  const remaining = planned - expense;
  const cash = income - expense;
  const categoryById = new Map(categories.map(c => [c.id,c]));
  const memberById = new Map(members.map(m => [m.id,m]));
  const expenseByCategory = new Map();
  transactions.filter(t => t.type === "expense" && t.category_id).forEach(t => expenseByCategory.set(t.category_id, (expenseByCategory.get(t.category_id) ?? 0) + Number(t.amount)));
  return <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
    <div><h2 className="text-lg font-semibold">Anggaran dan keuangan</h2><p className="text-sm text-zinc-600">Pantau rencana anggaran, pemasukan, pengeluaran, dan saldo kas event.</p></div>
    {financeError === "category_in_use" ? <Alert>Kategori tidak dapat dihapus karena masih digunakan oleh transaksi. Ubah atau hapus transaksi terkait terlebih dahulu.</Alert> : null}
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Target anggaran event</p><p className="mt-1 font-semibold">{currency(targetBudget)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total anggaran kategori</p><p className="mt-1 font-semibold">{currency(planned)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Sisa anggaran kategori</p><p className={"mt-1 font-semibold " + (remaining < 0 ? "text-red-700" : "")}>{currency(remaining)}</p><p className="text-xs text-zinc-500">Anggaran kategori − pengeluaran aktual</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total pemasukan</p><p className="mt-1 font-semibold text-emerald-700">{currency(income)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total pengeluaran</p><p className="mt-1 font-semibold">{currency(expense)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Saldo kas</p><p className={"mt-1 font-semibold " + (cash < 0 ? "text-red-700" : "")}>{currency(cash)}</p><p className="text-xs text-zinc-500">Pemasukan − pengeluaran</p></div>
    </div>

    <div className="space-y-3 border-t border-zinc-100 pt-4">
      <div><h3 className="font-semibold">Kategori anggaran</h3><p className="text-sm text-zinc-600">Rencanakan batas biaya per kategori dan bandingkan dengan pengeluaran aktual.</p></div>
      {categories.length ? <div className="space-y-3">{categories.map(c => {
        const actual = expenseByCategory.get(c.id) ?? 0;
        const used = transactions.some(t => t.category_id === c.id);
        return <article key={c.id} className="rounded-lg border border-zinc-200 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h4 className="font-medium">{c.name}</h4><p className="mt-1 text-sm text-zinc-600">Rencana: {currency(c.planned_amount)} · Pengeluaran: {currency(actual)} · Sisa: {currency(Number(c.planned_amount)-actual)}</p></div><form action={deleteBudgetCategory}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="return_to" value={`/events/${eventId}/keuangan`}/><input type="hidden" name="category_id" value={c.id}/><ConfirmDeleteButton message={used ? "Kategori ini memiliki transaksi terkait. Hapus transaksi terkait terlebih dahulu. Tetap coba hapus kategori?" : "Hapus kategori anggaran ini?"}>Hapus</ConfirmDeleteButton></form></div>
          <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit kategori</summary><div className="mt-3"><BudgetCategoryForm eventId={eventId} category={c}/></div></details>
        </article>;
      })}</div> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kategori anggaran.</p>}
      <details><summary className="cursor-pointer text-sm font-medium text-indigo-700">Tambah kategori anggaran</summary><div className="mt-3"><BudgetCategoryForm eventId={eventId}/></div></details>
    </div>

    <div className="space-y-3 border-t border-zinc-100 pt-4">
      <div><h3 className="font-semibold">Riwayat transaksi</h3><p className="text-sm text-zinc-600">Catat setiap pemasukan dan pengeluaran event.</p></div>
      {transactions.length ? <div className="space-y-3">{transactions.map(t=><article key={t.id} className="rounded-lg border border-zinc-200 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-medium">{t.description}</h4><span className={"rounded-full px-2 py-0.5 text-xs " + (t.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800")}>{t.type === "income" ? "Pemasukan" : "Pengeluaran"}</span></div><p className={"mt-1 font-semibold " + (t.type === "income" ? "text-emerald-700" : "")}>{currency(t.amount)}</p><p className="mt-1 text-xs text-zinc-500">{dateFmt(t.trx_date)} · {categoryById.get(t.category_id)?.name ?? "Tanpa kategori"} · {memberById.get(t.recorded_by)?.full_name ?? "Pencatat tidak ditentukan"}</p>{t.reference ? <p className="mt-1 text-xs text-zinc-500">Referensi: {t.reference}</p> : null}</div><form action={deleteTransaction}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="return_to" value={`/events/${eventId}/keuangan`}/><input type="hidden" name="transaction_id" value={t.id}/><ConfirmDeleteButton message={'Hapus transaksi "' + t.description + '"?'}>Hapus</ConfirmDeleteButton></form></div>
        <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit transaksi</summary><div className="mt-3"><TransactionForm eventId={eventId} categories={categories} members={members} transaction={t}/></div></details>
      </article>)}</div> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada transaksi keuangan.</p>}
      <details><summary className="cursor-pointer text-sm font-medium text-indigo-700">Tambah transaksi</summary><div className="mt-3"><TransactionForm eventId={eventId} categories={categories} members={members}/></div></details>
    </div>
  </section>;
}
