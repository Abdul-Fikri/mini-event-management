import { deleteTask } from "@/actions/tasks";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import TaskForm from "@/components/events/TaskForm";
const dateFmt=new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeZone:"Asia/Jakarta"});
const statusLabel={todo:"Belum dikerjakan",in_progress:"Sedang dikerjakan",done:"Selesai",blocked:"Terhambat"};
const priorityLabel={low:"Rendah",medium:"Sedang",high:"Tinggi"};
export default function TaskSection({eventId,tasks,members}){
 const memberById=new Map(members.map(m=>[m.id,m]));
 const counts={todo:0,in_progress:0,done:0,blocked:0};
 tasks.forEach(t=>{counts[t.status]=(counts[t.status]??0)+1;});
 return <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
  <div><h2 className="text-lg font-semibold">Manajemen tugas</h2><p className="text-sm text-zinc-600">Bagikan pekerjaan kepada panitia, tentukan prioritas, dan pantau progresnya.</p></div>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(statusLabel).map(([key,label])=><div key={key} className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{counts[key]}</p></div>)}</div>
  {tasks.length?<div className="space-y-3">{tasks.map(task=><article key={task.id} className="rounded-lg border border-zinc-200 p-4">
   <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1">
    <h3 className="font-semibold">{task.title}</h3><p className="mt-1 text-sm text-zinc-600">{statusLabel[task.status]} · Prioritas {priorityLabel[task.priority]}</p>
    <p className="mt-1 text-sm text-zinc-600">PIC: {memberById.get(task.assigned_to)?.full_name??"Belum ditentukan"} · Deadline: {task.due_date?dateFmt.format(new Date(task.due_date+"T00:00:00")):"—"}</p>
    {task.description?<p className="mt-2 whitespace-pre-wrap text-sm">{task.description}</p>:null}{task.notes?<p className="mt-2 whitespace-pre-wrap text-xs text-zinc-500">Catatan: {task.notes}</p>:null}
   </div><form action={deleteTask}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="task_id" value={task.id}/><ConfirmDeleteButton message={'Hapus tugas "'+task.title+'"?'}>Hapus</ConfirmDeleteButton></form></div>
   <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit tugas / perbarui status</summary><div className="mt-3"><TaskForm eventId={eventId} members={members} task={task}/></div></details>
  </article>)}</div>:<p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada tugas untuk event ini.</p>}
  <div className="border-t border-zinc-100 pt-4"><h3 className="mb-3 font-medium">Tambah tugas</h3><TaskForm eventId={eventId} members={members}/></div>
 </section>;
}
