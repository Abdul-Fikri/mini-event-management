"use client";
import { useActionState } from "react";
import { saveEvent } from "@/actions/events";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
const initial = { ok: false, message: "", errors: {}, values: {} };
const STATUSES = [["draft","Draf"],["planned","Direncanakan"],["ongoing","Berlangsung"],["completed","Selesai"],["cancelled","Dibatalkan"]];
export default function EventForm({ event = null, members = [] }) {
  const [state, formAction, pending] = useActionState(saveEvent.bind(null, event?.id ?? null), initial);
  const value = (key) => state.values?.[key] ?? event?.[key] ?? "";
  return <form action={formAction} className="space-y-5">
    {state.message ? <Alert>{state.message}</Alert> : null}
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField id="name" name="name" label="Nama event" required defaultValue={value("name")} error={state.errors?.name}/>
      <TextField id="category" name="category" label="Kategori" defaultValue={value("category")} error={state.errors?.category}/>
      <TextField id="start_date" name="start_date" label="Tanggal mulai" type="date" required defaultValue={value("start_date")} error={state.errors?.start_date}/>
      <TextField id="end_date" name="end_date" label="Tanggal selesai" type="date" defaultValue={value("end_date")} error={state.errors?.end_date}/>
      <TextField id="location" name="location" label="Lokasi" defaultValue={value("location")} error={state.errors?.location}/>
      <div><label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label><select id="status" name="status" defaultValue={value("status") || "draft"} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">{STATUSES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div><label htmlFor="coordinator_id" className="mb-1 block text-sm font-medium">Koordinator (opsional)</label><select id="coordinator_id" name="coordinator_id" defaultValue={value("coordinator_id")} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Belum ditentukan</option>{members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}</select>{state.errors?.coordinator_id ? <p className="mt-1 text-sm text-red-700">{state.errors.coordinator_id}</p> : null}</div>
      <TextField id="target_budget" name="target_budget" label="Target anggaran (Rp)" type="number" min="0" step="1" defaultValue={value("target_budget")} error={state.errors?.target_budget}/>
    </div>
    <TextField id="description" name="description" label="Deskripsi" multiline defaultValue={value("description")} error={state.errors?.description}/>
    <div className="flex flex-wrap gap-2"><Button type="submit" pending={pending} pendingText="Menyimpan…">Simpan event</Button><a href={event ? `/events/${event.id}` : "/events"} className="rounded-md border border-zinc-300 px-4 py-2 text-sm">Batal</a></div>
  </form>;
}
