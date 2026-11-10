"use client";
import { useActionState } from "react";
import { saveBudgetCategory } from "@/actions/finance";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initial = { message: "", errors: {}, values: {} };
export default function BudgetCategoryForm({ eventId, category = null }) {
  const [state, action, pending] = useActionState(saveBudgetCategory.bind(null, eventId, category?.id ?? null), initial);
  const value = key => state.values?.[key] ?? (category?.[key] ?? "");
  return <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
    {state.message ? <Alert>{state.message}</Alert> : null}
    <TextField id={"budget-name-" + (category?.id ?? "new")} name="name" label="Nama kategori" defaultValue={value("name")} error={state.errors?.name} required/>
    <TextField id={"budget-plan-" + (category?.id ?? "new")} name="planned_amount" label="Anggaran rencana (Rp)" type="number" min="0" step="1" defaultValue={value("planned_amount")} hint="Masukkan angka bulat tanpa titik atau koma, contoh: 1000000 untuk Rp1.000.000." error={state.errors?.planned_amount} required/>
    <Button type="submit" pending={pending} pendingText="Menyimpan…">{category ? "Simpan kategori" : "Tambah kategori"}</Button>
  </form>;
}
