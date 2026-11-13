"use client";
import { useActionState } from "react";
import { saveScheduleItem } from "@/actions/schedule";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
const initial={message:"",errors:{},values:{}};
export default function ScheduleItemForm({eventId,members,item=null,eventStartDate,returnTo=`/events/${eventId}/rundown`}){
 const [state,action,pending]=useActionState(saveScheduleItem.bind(null,eventId,item?.id??null),initial);
 const value=key=>state.values?.[key]??item?.[key]??(key==="item_date"?eventStartDate:"");
 return <form action={action} className="management-form space-y-3 p-4">
  <input type="hidden" name="return_to" value={returnTo}/>
  {state.message?<Alert>{state.message}</Alert>:null}
  <TextField id={"schedule-title-"+(item?.id??"new")} name="title" label="Nama kegiatan" defaultValue={value("title")} error={state.errors?.title} required/>
  <div className="grid gap-3 sm:grid-cols-3">
   <TextField id={"schedule-date-"+(item?.id??"new")} name="item_date" label="Tanggal" type="date" defaultValue={value("item_date")} error={state.errors?.item_date} required/>
   <TextField id={"schedule-start-"+(item?.id??"new")} name="start_time" label="Mulai" type="time" defaultValue={value("start_time")} error={state.errors?.start_time}/>
   <TextField id={"schedule-end-"+(item?.id??"new")} name="end_time" label="Selesai" type="time" defaultValue={value("end_time")} error={state.errors?.end_time}/>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <TextField id={"schedule-location-"+(item?.id??"new")} name="location" label="Lokasi kegiatan" defaultValue={value("location")} error={state.errors?.location}/>
   <div><label htmlFor={"schedule-pic-"+(item?.id??"new")} className="mb-1.5 block text-sm font-medium text-slate-700">PIC</label><select id={"schedule-pic-"+(item?.id??"new")} name="pic_member_id" defaultValue={value("pic_member_id")} className="block w-full rounded-xl border border-[#D8E3ED] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8FB0CE] focus:outline-none focus:ring-2 focus:ring-[#8FB0CE]/20"><option value="">Belum ditentukan</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select>{state.errors?.pic_member_id?<p className="mt-1 text-sm text-red-700">{state.errors.pic_member_id}</p>:null}</div>
  </div>
  <TextField id={"schedule-notes-"+(item?.id??"new")} name="notes" label="Catatan" multiline defaultValue={value("notes")} error={state.errors?.notes}/>
  <Button type="submit" pending={pending} pendingText="Menyimpan…">{item?"Simpan perubahan":"Tambah ke rundown"}</Button>
 </form>;
}
