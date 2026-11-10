import { deleteScheduleItem } from "@/actions/schedule";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import ScheduleItemForm from "@/components/events/ScheduleItemForm";
const dateFmt=new Intl.DateTimeFormat("id-ID",{dateStyle:"long",timeZone:"Asia/Jakarta"});
const timeFmt=value=>value?value.slice(0,5):"—";
export default function ScheduleSection({eventId,eventStartDate,schedule,members}){
 const memberById=new Map(members.map(m=>[m.id,m]));
 return <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
  <div><h2 className="text-lg font-semibold">Rundown acara</h2><p className="text-sm text-zinc-600">Susun kegiatan berdasarkan tanggal dan jam, lalu tentukan penanggung jawabnya.</p></div>
  {schedule.length?<div className="space-y-3">{schedule.map((item,index)=><article key={item.id} className="rounded-lg border border-zinc-200 p-4">
   <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1">
    <p className="text-xs font-medium text-indigo-700">KEGIATAN {index+1} · {dateFmt.format(new Date(item.item_date+"T00:00:00"))}</p>
    <h3 className="mt-1 font-semibold">{item.title}</h3><p className="mt-1 text-sm text-zinc-600">{timeFmt(item.start_time)} – {timeFmt(item.end_time)}{item.location?" · "+item.location:""}</p>
    <p className="mt-1 text-sm text-zinc-600">PIC: {memberById.get(item.pic_member_id)?.full_name??"Belum ditentukan"}</p>{item.notes?<p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{item.notes}</p>:null}
   </div><form action={deleteScheduleItem}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="return_to" value={`/events/${eventId}/rundown`}/><input type="hidden" name="item_id" value={item.id}/><ConfirmDeleteButton message={'Hapus kegiatan "'+item.title+'" dari rundown?'}>Hapus</ConfirmDeleteButton></form></div>
   <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit kegiatan</summary><div className="mt-3"><ScheduleItemForm eventId={eventId} members={members} item={item} eventStartDate={eventStartDate}/></div></details>
  </article>)}</div>:<p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kegiatan dalam rundown event ini.</p>}
  <div className="border-t border-zinc-100 pt-4"><h3 className="mb-3 font-medium">Tambah kegiatan</h3><ScheduleItemForm eventId={eventId} members={members} eventStartDate={eventStartDate}/></div>
 </section>;
}
