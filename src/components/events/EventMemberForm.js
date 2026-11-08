"use client";
import { useActionState } from "react";
import { saveEventMember } from "@/actions/event-members";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
const initial = { message:"", errors:{}, values:{} };
export default function EventMemberForm({ eventId, members, assignment = null }) {
  const [state, action, pending] = useActionState(saveEventMember.bind(null,eventId,assignment?.id ?? null),initial);
  const value = key => state.values?.[key] ?? assignment?.[key] ?? "";
  const available = assignment ? members : members.filter(m => !m.assigned);
  return <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
    {state.message ? <Alert>{state.message}</Alert> : null}
    <div><label htmlFor={`member-${assignment?.id ?? "new"}`} className="mb-1 block text-sm font-medium">Anggota</label><select id={`member-${assignment?.id ?? "new"}`} name="member_id" defaultValue={value("member_id")} required className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Pilih anggota</option>{available.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select>{state.errors?.member_id ? <p className="mt-1 text-sm text-red-700">{state.errors.member_id}</p> : null}</div>
    <div className="grid gap-3 sm:grid-cols-2"><TextField id={`division-${assignment?.id ?? "new"}`} name="division" label="Divisi" defaultValue={value("division")} error={state.errors?.division}/><TextField id={`position-${assignment?.id ?? "new"}`} name="position_title" label="Jabatan" defaultValue={value("position_title")} error={state.errors?.position_title}/></div>
    <TextField id={`responsibility-${assignment?.id ?? "new"}`} name="responsibility" label="Tanggung jawab" multiline defaultValue={value("responsibility")} error={state.errors?.responsibility}/>
    <Button type="submit" pending={pending} pendingText="Menyimpan…">{assignment ? "Simpan perubahan" : "Tambahkan ke panitia"}</Button>
  </form>;
}
