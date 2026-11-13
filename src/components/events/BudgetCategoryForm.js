"use client";
import { useActionState } from "react";
import { saveBudgetCategory } from "@/actions/finance";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { MoneyField } from "@/components/ui/MoneyField";

const initial = { message: "", errors: {}, values: {} };
export default function BudgetCategoryForm({ eventId, category = null, returnTo = `/events/${eventId}/keuangan` }) {
  const [state, action, pending] = useActionState(saveBudgetCategory.bind(null, eventId, category?.id ?? null), initial);
  const value = key => state.values?.[key] ?? (category?.[key] ?? "");
  return <form action={action} className="management-form space-y-3 p-4">
    <input type="hidden" name="return_to" value={returnTo}/>
    {state.message ? <Alert>{state.message}</Alert> : null}
    <TextField id={"budget-name-" + (category?.id ?? "new")} name="name" label="Nama kategori" defaultValue={value("name")} error={state.errors?.name} required/>
    <MoneyField id={"budget-plan-" + (category?.id ?? "new")} name="planned_amount" label="Anggaran rencana (Rp)" defaultValue={value("planned_amount")} hint="Pemisah ribuan ditambahkan otomatis, contoh: 500.000." error={state.errors?.planned_amount} required/>
    <Button type="submit" pending={pending} pendingText="Menyimpan…">{category ? "Simpan kategori" : "Tambah kategori"}</Button>
  </form>;
}
