import { deleteBudgetCategory, deleteTransaction } from "@/actions/finance";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Alert } from "@/components/ui/Alert";
import BudgetCategoryForm from "@/components/events/BudgetCategoryForm";
import TransactionForm from "@/components/events/TransactionForm";

const currency = value => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));
const dateFmt = value => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value + "T00:00:00"));

export default function FinanceSection({ eventId, targetBudget, categories, transactions, members, commitments = [], financeError = "" }) {
  const income = transactions.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount), 0);
  const planned = categories.reduce((s,c) => s + Number(c.planned_amount), 0);
  const committed = commitments.reduce((s,item) => s + (item.est_unit_price == null ? 0 : Number(item.est_unit_price) * Number(item.quantity)), 0);
  const unpricedCommitments = commitments.filter(item => item.est_unit_price == null).length;
  const remainingAfterCommitment = planned - expense - committed;
  const cash = income - expense;
  const categoryById = new Map(categories.map(c => [c.id,c]));
  const memberById = new Map(members.map(m => [m.id,m]));
  const expenseByCategory = new Map();
  const commitmentByCategory = new Map();
  transactions.filter(t => t.type === "expense" && t.category_id).forEach(t => expenseByCategory.set(t.category_id, (expenseByCategory.get(t.category_id) ?? 0) + Number(t.amount)));
  commitments.filter(item => item.category_id && item.est_unit_price != null).forEach(item => commitmentByCategory.set(item.category_id, (commitmentByCategory.get(item.category_id) ?? 0) + Number(item.est_unit_price) * Number(item.quantity)));

  return <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
    <div><h2 className="text-lg font-semibold">Anggaran dan keuangan</h2><p className="text-sm text-zinc-600">Pantau seluruh pemasukan, pengeluaran aktual, dan komitmen pembelian dari Pengadaan dalam satu pencatatan.</p></div>
    {financeError === "category_in_use" ? <Alert>Kategori tidak dapat dihapus karena masih digunakan oleh transaksi. Ubah atau hapus transaksi terkait terlebih dahulu.</Alert> : null}
    {financeError === "procurement_managed" ? <Alert>Transaksi ini dibuat dari Pengadaan dan dikelola dari sana. Edit atau hapus item Pengadaan terkait agar pencatatan tetap sinkron.</Alert> : null}
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Target anggaran event</p><p className="mt-1 font-semibold">{currency(targetBudget)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total anggaran kategori</p><p className="mt-1 font-semibold">{currency(planned)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Pengeluaran aktual</p><p className="mt-1 font-semibold">{currency(expense)}</p><p className="text-xs text-zinc-500">Termasuk pembelian dari Pengadaan</p></div>
      <div className="rounded-md bg-amber-50 p-3"><p className="text-xs text-amber-800">Komitmen pengadaan</p><p className="mt-1 font-semibold">{currency(committed)}</p><p className="text-xs text-amber-800">Item berstatus Dipesan, berdasarkan estimasi</p></div>
      <div className={`rounded-md p-3 ${remainingAfterCommitment < 0 ? "bg-red-50" : "bg-zinc-50"}`}><p className="text-xs text-zinc-500">Sisa setelah komitmen</p><p className={`mt-1 font-semibold ${remainingAfterCommitment < 0 ? "text-red-700" : ""}`}>{currency(remainingAfterCommitment)}</p><p className="text-xs text-zinc-500">Anggaran kategori − aktual − komitmen</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total pemasukan</p><p className="mt-1 font-semibold text-emerald-700">{currency(income)}</p></div>
      <div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Saldo kas</p><p className={`mt-1 font-semibold ${cash < 0 ? "text-red-700" : ""}`}>{currency(cash)}</p><p className="text-xs text-zinc-500">Pemasukan − pengeluaran aktual</p></div>
    </div>

    {commitments.length ? <details className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-amber-900">Rincian komitmen pengadaan ({commitments.length} item)</summary>
      <p className="mt-2 text-xs text-zinc-600">Komitmen adalah barang yang sudah dipesan tetapi belum berstatus Sudah dibeli. Nilainya belum mengurangi saldo kas dan belum dihitung sebagai pengeluaran aktual.</p>
      <div className="mt-3 space-y-2">{commitments.map(item=><div key={item.id} className="flex flex-wrap items-start justify-between gap-2 border-t border-amber-100 pt-2 text-sm"><div><p className="font-medium">{item.name}</p><p className="text-xs text-zinc-600">{Number(item.quantity)} {item.unit ?? "unit"} · {categoryById.get(item.category_id)?.name ?? "Tanpa kategori"}</p></div><p className="font-medium tabular-nums">{item.est_unit_price == null ? "Estimasi belum diisi" : currency(Number(item.est_unit_price) * Number(item.quantity))}</p></div>)}</div>
      {unpricedCommitments ? <p className="mt-2 text-xs text-amber-900">{unpricedCommitments} item belum memiliki estimasi harga sehingga belum masuk total komitmen.</p> : null}
    </details> : <p className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">Belum ada item berstatus Dipesan. Item yang dipesan akan muncul di sini sebagai komitmen, bukan pengeluaran aktual.</p>}

    <div className="space-y-3 border-t border-zinc-100 pt-4">
      <div><h3 className="font-semibold">Kategori anggaran</h3><p className="text-sm text-zinc-600">Bandingkan batas biaya dengan pengeluaran aktual dan komitmen pembelian per kategori.</p></div>
      {categories.length ? <div className="space-y-3">{categories.map(c => {
        const actual = expenseByCategory.get(c.id) ?? 0;
        const commitment = commitmentByCategory.get(c.id) ?? 0;
        const remaining = Number(c.planned_amount) - actual - commitment;
        const used = transactions.some(t => t.category_id === c.id);
        const hasCommitments = commitments.some(item => item.category_id === c.id);
        const deleteMessage = used
          ? "Kategori ini memiliki transaksi terkait dan tidak dapat dihapus selama transaksi tersebut masih ada."
          : hasCommitments
            ? "Kategori ini dipakai item pengadaan berstatus Dipesan. Jika kategori dihapus, item tersebut akan menjadi Tanpa kategori. Lanjutkan?"
            : "Hapus kategori anggaran ini?";
        return <article key={c.id} className="rounded-lg border border-zinc-200 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h4 className="font-medium">{c.name}</h4><p className="mt-1 text-sm text-zinc-600">Rencana: {currency(c.planned_amount)} · Aktual: {currency(actual)} · Komitmen: {currency(commitment)} · Sisa: <span className={remaining < 0 ? "font-semibold text-red-700" : "font-medium"}>{currency(remaining)}</span></p></div><form action={deleteBudgetCategory}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="return_to" value={`/events/${eventId}/keuangan`}/><input type="hidden" name="category_id" value={c.id}/><ConfirmDeleteButton message={deleteMessage}>Hapus</ConfirmDeleteButton></form></div>
          <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit kategori</summary><div className="mt-3"><BudgetCategoryForm eventId={eventId} category={c}/></div></details>
        </article>;
      })}</div> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kategori anggaran.</p>}
      <details><summary className="cursor-pointer text-sm font-medium text-indigo-700">Tambah kategori anggaran</summary><div className="mt-3"><BudgetCategoryForm eventId={eventId}/></div></details>
    </div>

    <div className="space-y-3 border-t border-zinc-100 pt-4">
      <div><h3 className="font-semibold">Riwayat transaksi</h3><p className="text-sm text-zinc-600">Semua pemasukan dan pengeluaran aktual tercatat di sini. Pembelian berstatus Sudah dibeli dari Pengadaan masuk otomatis, jadi jangan input ulang secara manual.</p></div>
      {transactions.length ? <div className="space-y-3">{transactions.map(t=>{
        const linkedToProcurement=Boolean(t.procurement_item_id);
        const historicalProcurement=!linkedToProcurement&&String(t.reference??"").startsWith("Pengadaan otomatis");
        const fromProcurement=linkedToProcurement||historicalProcurement;
        return <article key={t.id} className="rounded-lg border border-zinc-200 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-medium">{t.description}</h4><span className={`rounded-full px-2 py-0.5 text-xs ${t.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{t.type === "income" ? "Pemasukan" : "Pengeluaran"}</span><span className={`rounded-full px-2 py-0.5 text-xs ${fromProcurement ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-600"}`}>{fromProcurement ? "Sumber: Pengadaan" : "Input manual"}</span></div><p className={`mt-1 font-semibold ${t.type === "income" ? "text-emerald-700" : ""}`}>{currency(t.amount)}</p><p className="mt-1 text-xs text-zinc-500">{dateFmt(t.trx_date)} · {categoryById.get(t.category_id)?.name ?? "Tanpa kategori"} · {memberById.get(t.recorded_by)?.full_name ?? "Pencatat tidak ditentukan"}</p>{t.reference ? <p className="mt-1 text-xs text-zinc-500">Referensi: {t.reference}</p> : null}{linkedToProcurement ? <a className="mt-2 inline-block text-xs font-medium text-indigo-700 hover:underline" href={`/events/${eventId}/pengadaan`}>Dikelola dari Pengadaan →</a> : historicalProcurement ? <p className="mt-2 text-xs text-zinc-500">Item Pengadaan asal sudah dihapus; transaksi tetap dipertahankan sebagai riwayat keuangan.</p> : null}</div>
          {!linkedToProcurement ? <form action={deleteTransaction}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="return_to" value={`/events/${eventId}/keuangan`}/><input type="hidden" name="transaction_id" value={t.id}/><ConfirmDeleteButton message={'Hapus transaksi "' + t.description + '"?'}>Hapus</ConfirmDeleteButton></form> : <span className="self-start text-xs text-zinc-500">Dikelola dari Pengadaan</span>}</div>
          {!linkedToProcurement ? <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit transaksi</summary><div className="mt-3"><TransactionForm eventId={eventId} categories={categories} members={members} transaction={t}/></div></details> : null}
        </article>;
      })}</div> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada transaksi keuangan.</p>}
      <details><summary className="cursor-pointer text-sm font-medium text-indigo-700">Tambah transaksi manual</summary><div className="mt-3"><TransactionForm eventId={eventId} categories={categories} members={members}/></div></details>
    </div>
  </section>;
}
