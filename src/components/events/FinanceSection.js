"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteBudgetCategory, deleteTransaction } from "@/actions/finance";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Alert } from "@/components/ui/Alert";
import BudgetCategoryForm from "@/components/events/BudgetCategoryForm";
import TransactionForm from "@/components/events/TransactionForm";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;
const currency = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));
const dateFmt = (value) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value + "T00:00:00"));

function PageSummary({ startIndex, visibleCount, total, label }) {
  if (!total) return <p className="text-xs text-zinc-500">Belum ada {label}.</p>;
  return <p className="text-xs text-zinc-500" aria-live="polite">Menampilkan {startIndex + 1}–{startIndex + visibleCount} dari {total} {label}.</p>;
}

export default function FinanceSection({
  eventId,
  targetBudget,
  categories,
  transactions,
  members,
  commitments = [],
  financeError = "",
  standaloneView = null,
}) {
  const [categoryPage, setCategoryPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [commitmentPage, setCommitmentPage] = useState(1);

  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
  const planned = categories.reduce((sum, category) => sum + Number(category.planned_amount), 0);
  const committed = commitments.reduce((sum, item) => sum + (item.est_unit_price == null ? 0 : Number(item.est_unit_price) * Number(item.quantity)), 0);
  const unpricedCommitments = commitments.filter((item) => item.est_unit_price == null).length;
  const remainingAfterCommitment = planned - expense - committed;
  const cash = income - expense;
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const memberById = new Map(members.map((member) => [member.id, member]));
  const expenseByCategory = new Map();
  const commitmentByCategory = new Map();

  transactions.filter((item) => item.type === "expense" && item.category_id).forEach((item) => {
    expenseByCategory.set(item.category_id, (expenseByCategory.get(item.category_id) ?? 0) + Number(item.amount));
  });
  commitments.filter((item) => item.category_id && item.est_unit_price != null).forEach((item) => {
    commitmentByCategory.set(item.category_id, (commitmentByCategory.get(item.category_id) ?? 0) + Number(item.est_unit_price) * Number(item.quantity));
  });

  const basePath = `/events/${eventId}/keuangan`;
  const returnTo = standaloneView ? `${basePath}/${standaloneView}` : basePath;
  const categoryTotalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const transactionTotalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const commitmentTotalPages = Math.max(1, Math.ceil(commitments.length / PAGE_SIZE));
  const currentCategoryPage = Math.min(categoryPage, categoryTotalPages);
  const currentTransactionPage = Math.min(transactionPage, transactionTotalPages);
  const currentCommitmentPage = Math.min(commitmentPage, commitmentTotalPages);
  const categoryStart = (currentCategoryPage - 1) * PAGE_SIZE;
  const transactionStart = (currentTransactionPage - 1) * PAGE_SIZE;
  const commitmentStart = (currentCommitmentPage - 1) * PAGE_SIZE;
  const visibleCategories = categories.slice(categoryStart, categoryStart + PAGE_SIZE);
  const visibleTransactions = transactions.slice(transactionStart, transactionStart + PAGE_SIZE);
  const visibleCommitments = commitments.slice(commitmentStart, commitmentStart + PAGE_SIZE);

  const categoryCards = (rows) => rows.map((category) => {
    const actual = expenseByCategory.get(category.id) ?? 0;
    const categoryCommitment = commitmentByCategory.get(category.id) ?? 0;
    const remaining = Number(category.planned_amount) - actual - categoryCommitment;
    const used = transactions.some((item) => item.category_id === category.id);
    const hasCommitments = commitments.some((item) => item.category_id === category.id);
    const deleteMessage = used
      ? "Kategori ini memiliki transaksi terkait dan tidak dapat dihapus selama transaksi tersebut masih ada."
      : hasCommitments
        ? "Kategori ini dipakai item pengadaan berstatus Dipesan. Jika kategori dihapus, item tersebut akan menjadi Tanpa kategori. Lanjutkan?"
        : "Hapus kategori anggaran ini?";

    return (
      <article key={category.id} className="rounded-lg border border-zinc-200 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium">{category.name}</h4>
            <p className="mt-1 text-sm text-zinc-600">
              Rencana: {currency(category.planned_amount)} · Aktual: {currency(actual)} · Komitmen: {currency(categoryCommitment)} · Sisa: <span className={remaining < 0 ? "font-semibold text-red-700" : "font-medium"}>{currency(remaining)}</span>
            </p>
          </div>
          <form action={deleteBudgetCategory}>
            <input type="hidden" name="event_id" value={eventId} />
            <input type="hidden" name="return_to" value={returnTo} />
            <input type="hidden" name="category_id" value={category.id} />
            <ConfirmDeleteButton message={deleteMessage}>Hapus</ConfirmDeleteButton>
          </form>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit kategori</summary>
          <div className="mt-3"><BudgetCategoryForm eventId={eventId} category={category} returnTo={returnTo} /></div>
        </details>
      </article>
    );
  });

  const transactionCards = (rows) => rows.map((transaction) => {
    const linkedToProcurement = Boolean(transaction.procurement_item_id);
    const historicalProcurement = !linkedToProcurement && String(transaction.reference ?? "").startsWith("Pengadaan otomatis");
    const fromProcurement = linkedToProcurement || historicalProcurement;

    return (
      <article key={transaction.id} className="rounded-lg border border-zinc-200 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-medium">{transaction.description}</h4>
              <span className={`rounded-full px-2 py-0.5 text-xs ${transaction.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${fromProcurement ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-600"}`}>{fromProcurement ? "Sumber: Pengadaan" : "Input manual"}</span>
            </div>
            <p className={`mt-1 font-semibold ${transaction.type === "income" ? "text-emerald-700" : ""}`}>{currency(transaction.amount)}</p>
            <p className="mt-1 text-xs text-zinc-500">{dateFmt(transaction.trx_date)} · {categoryById.get(transaction.category_id)?.name ?? "Tanpa kategori"} · {memberById.get(transaction.recorded_by)?.full_name ?? "Pencatat tidak ditentukan"}</p>
            {transaction.reference ? <p className="mt-1 text-xs text-zinc-500">Referensi: {transaction.reference}</p> : null}
            {linkedToProcurement ? <Link className="mt-2 inline-block text-xs font-medium text-indigo-700 hover:underline" href={`/events/${eventId}/pengadaan`}>Dikelola dari Pengadaan →</Link> : historicalProcurement ? <p className="mt-2 text-xs text-zinc-500">Item Pengadaan asal sudah dihapus; transaksi tetap dipertahankan sebagai riwayat keuangan.</p> : null}
          </div>
          {!linkedToProcurement ? (
            <form action={deleteTransaction}>
              <input type="hidden" name="event_id" value={eventId} />
              <input type="hidden" name="return_to" value={returnTo} />
              <input type="hidden" name="transaction_id" value={transaction.id} />
              <ConfirmDeleteButton message={`Hapus transaksi "${transaction.description}"?`}>Hapus</ConfirmDeleteButton>
            </form>
          ) : <span className="self-start text-xs text-zinc-500">Dikelola dari Pengadaan</span>}
        </div>
        {!linkedToProcurement ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit transaksi</summary>
            <div className="mt-3"><TransactionForm eventId={eventId} categories={categories} members={members} transaction={transaction} returnTo={returnTo} /></div>
          </details>
        ) : null}
      </article>
    );
  });

  const commitmentCards = (rows) => rows.map((item) => (
    <div key={item.id} className="flex flex-wrap items-start justify-between gap-2 border-t border-amber-100 pt-2 text-sm">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-zinc-600">{Number(item.quantity)} {item.unit ?? "unit"} · {categoryById.get(item.category_id)?.name ?? "Tanpa kategori"}</p>
        <Link className="mt-1 inline-block text-xs font-medium text-indigo-700 hover:underline" href={`/events/${eventId}/pengadaan`}>Lihat item Pengadaan →</Link>
      </div>
      <p className="font-medium tabular-nums">{item.est_unit_price == null ? "Estimasi belum diisi" : currency(Number(item.est_unit_price) * Number(item.quantity))}</p>
    </div>
  ));

  if (standaloneView === "categories") {
    return (
      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <Link href={basePath} className="text-sm font-medium text-indigo-700 hover:underline">← Kembali ke Keuangan</Link>
          <h2 className="mt-2 text-xl font-semibold">Semua kategori anggaran</h2>
          <p className="text-sm text-zinc-600">Kelola kategori dan pantau anggaran, pengeluaran aktual, serta komitmen per kategori.</p>
        </div>
        {financeError === "category_in_use" ? <Alert>Kategori tidak dapat dihapus karena masih digunakan oleh transaksi. Ubah atau hapus transaksi terkait terlebih dahulu.</Alert> : null}
        {categories.length ? <><PageSummary startIndex={categoryStart} visibleCount={visibleCategories.length} total={categories.length} label="kategori" /><div className="space-y-3">{categoryCards(visibleCategories)}</div><ListPagination currentPage={currentCategoryPage} totalPages={categoryTotalPages} onPageChange={setCategoryPage} /></> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kategori anggaran.</p>}
      </section>
    );
  }

  if (standaloneView === "transactions") {
    return (
      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <Link href={basePath} className="text-sm font-medium text-indigo-700 hover:underline">← Kembali ke Keuangan</Link>
          <h2 className="mt-2 text-xl font-semibold">Semua riwayat transaksi</h2>
          <p className="text-sm text-zinc-600">Seluruh pemasukan dan pengeluaran aktual event. Transaksi yang berasal dari Pengadaan tetap dikelola melalui Pengadaan.</p>
        </div>
        {financeError === "procurement_managed" ? <Alert>Transaksi ini dibuat dari Pengadaan dan dikelola dari sana. Edit atau hapus item Pengadaan terkait agar pencatatan tetap sinkron.</Alert> : null}
        {transactions.length ? <><PageSummary startIndex={transactionStart} visibleCount={visibleTransactions.length} total={transactions.length} label="transaksi" /><div className="space-y-3">{transactionCards(visibleTransactions)}</div><ListPagination currentPage={currentTransactionPage} totalPages={transactionTotalPages} onPageChange={setTransactionPage} /></> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada transaksi keuangan.</p>}
      </section>
    );
  }

  if (standaloneView === "commitments") {
    return (
      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <Link href={basePath} className="text-sm font-medium text-indigo-700 hover:underline">← Kembali ke Keuangan</Link>
          <h2 className="mt-2 text-xl font-semibold">Semua komitmen pengadaan</h2>
          <p className="text-sm text-zinc-600">Barang berstatus Dipesan yang menjadi estimasi komitmen anggaran, bukan pengeluaran aktual.</p>
        </div>
        {commitments.length ? <><PageSummary startIndex={commitmentStart} visibleCount={visibleCommitments.length} total={commitments.length} label="komitmen" /><div className="space-y-2">{commitmentCards(visibleCommitments)}</div><ListPagination currentPage={currentCommitmentPage} totalPages={commitmentTotalPages} onPageChange={setCommitmentPage} />{unpricedCommitments ? <p className="text-xs text-amber-900">{unpricedCommitments} item belum memiliki estimasi harga sehingga belum masuk total komitmen.</p> : null}</> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada item berstatus Dipesan.</p>}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
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

      <details className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-amber-900">Rincian komitmen pengadaan ({commitments.length} item)</summary>
        <p className="mt-2 text-xs text-zinc-600">Komitmen adalah barang yang sudah dipesan tetapi belum berstatus Sudah dibeli. Nilainya belum mengurangi saldo kas dan belum dihitung sebagai pengeluaran aktual.</p>
        {commitments.length ? (
          <>
            <div className="mt-3 flex justify-end"><Link href={`${basePath}/commitments`} className="text-xs font-medium text-indigo-700 hover:underline">Lihat semua komitmen →</Link></div>
            <PageSummary startIndex={commitmentStart} visibleCount={visibleCommitments.length} total={commitments.length} label="komitmen" />
            <div className="mt-2 space-y-2">{commitmentCards(visibleCommitments)}</div>
            <ListPagination currentPage={currentCommitmentPage} totalPages={commitmentTotalPages} onPageChange={setCommitmentPage} />
          </>
        ) : <p className="mt-2 text-sm text-zinc-600">Belum ada item berstatus Dipesan. Item yang dipesan akan muncul di sini sebagai komitmen, bukan pengeluaran aktual.</p>}
        {unpricedCommitments ? <p className="mt-2 text-xs text-amber-900">{unpricedCommitments} item belum memiliki estimasi harga sehingga belum masuk total komitmen.</p> : null}
      </details>

      <div className="space-y-3 border-t border-zinc-100 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="font-semibold">Kategori anggaran</h3><p className="text-sm text-zinc-600">Bandingkan batas biaya dengan pengeluaran aktual dan komitmen pembelian per kategori.</p></div>
          {categories.length > 0 ? <Link href={`${basePath}/categories`} className="shrink-0 text-sm font-medium text-indigo-700 hover:underline">Lihat semua kategori</Link> : null}
        </div>
        {categories.length ? <><PageSummary startIndex={categoryStart} visibleCount={visibleCategories.length} total={categories.length} label="kategori" /><div className="space-y-3">{categoryCards(visibleCategories)}</div><ListPagination currentPage={currentCategoryPage} totalPages={categoryTotalPages} onPageChange={setCategoryPage} /></> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kategori anggaran.</p>}
        <details><summary className="cursor-pointer text-sm font-medium text-indigo-700">Tambah kategori anggaran</summary><div className="mt-3"><BudgetCategoryForm eventId={eventId} returnTo={returnTo} /></div></details>
      </div>

      <div className="space-y-3 border-t border-zinc-100 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="font-semibold">Riwayat transaksi</h3><p className="text-sm text-zinc-600">Semua pemasukan dan pengeluaran aktual tercatat di sini. Pembelian berstatus Sudah dibeli dari Pengadaan masuk otomatis, jadi jangan input ulang secara manual.</p></div>
          {transactions.length > 0 ? <Link href={`${basePath}/transactions`} className="shrink-0 text-sm font-medium text-indigo-700 hover:underline">Lihat semua transaksi</Link> : null}
        </div>
        {transactions.length ? <><PageSummary startIndex={transactionStart} visibleCount={visibleTransactions.length} total={transactions.length} label="transaksi" /><div className="space-y-3">{transactionCards(visibleTransactions)}</div><ListPagination currentPage={currentTransactionPage} totalPages={transactionTotalPages} onPageChange={setTransactionPage} /></> : <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada transaksi keuangan.</p>}
        <details><summary className="cursor-pointer text-sm font-medium text-indigo-700">Tambah transaksi manual</summary><div className="mt-3"><TransactionForm eventId={eventId} categories={categories} members={members} returnTo={returnTo} /></div></details>
      </div>
    </section>
  );
}
