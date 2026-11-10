"use client";
import { useActionState } from "react";
import { saveTask } from "@/actions/tasks";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
const initial={message:"",errors:{},values:{}};
export default function TaskForm({eventId,members,task=null}){
 const [state,action,pending]=useActionState(saveTask.bind(null,eventId,task?.id??null),initial);
 const value=key=>state.values?.[key]??task?.[key]??"";
 return <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
  <input type="hidden" name="return_to" value={`/events/${eventId}/tugas`}/>
  {state.message?<Alert>{state.message}</Alert>:null}
  <TextField id={"task-title-"+(task?.id??"new")} name="title" label="Nama tugas" defaultValue={value("title")} error={state.errors?.title} required/>
  <TextField id={"task-description-"+(task?.id??"new")} name="description" label="Deskripsi tugas" multiline defaultValue={value("description")} error={state.errors?.description}/>
  <div className="grid gap-3 sm:grid-cols-2">
   <div><label htmlFor={"task-assignee-"+(task?.id??"new")} className="mb-1 block text-sm font-medium">Penanggung jawab</label><select id={"task-assignee-"+(task?.id??"new")} name="assigned_to" defaultValue={value("assigned_to")} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Belum ditentukan</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select>{state.errors?.assigned_to?<p className="mt-1 text-sm text-red-700">{state.errors.assigned_to}</p>:null}</div>
   <TextField id={"task-due-"+(task?.id??"new")} name="due_date" label="Deadline" type="date" defaultValue={value("due_date")} hint="Opsional. Bisa diisi tanggal lampau, hari ini, atau mendatang, dan dapat diubah kapan saja." error={state.errors?.due_date}/>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <div><label htmlFor={"task-priority-"+(task?.id??"new")} className="mb-1 block text-sm font-medium">Prioritas</label><select id={"task-priority-"+(task?.id??"new")} name="priority" defaultValue={value("priority")||"medium"} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></div>
   <div><label htmlFor={"task-status-"+(task?.id??"new")} className="mb-1 block text-sm font-medium">Status</label><select id={"task-status-"+(task?.id??"new")} name="status" defaultValue={value("status")||"todo"} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="todo">Belum dikerjakan</option><option value="in_progress">Sedang dikerjakan</option><option value="done">Selesai</option><option value="blocked">Terhambat</option></select></div>
  </div>
  <TextField id={"task-notes-"+(task?.id??"new")} name="notes" label="Catatan" multiline defaultValue={value("notes")} error={state.errors?.notes}/>
  <Button type="submit" pending={pending} pendingText="Menyimpan…">{task?"Simpan perubahan":"Tambah tugas"}</Button>
 </form>;
}
