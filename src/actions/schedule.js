"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { scheduleFields,scheduleSchema } from "@/lib/validators/schedule";
import { fieldErrors,readForm } from "@/lib/validators/helpers";
import { getEventReturnPath } from "@/lib/events/return-path";
const empty={message:"",errors:{},values:{}};
export async function saveScheduleItem(eventId,itemId,_prev,formData){
 const {group}=await requireGroup(); const returnPath=getEventReturnPath(eventId,formData); const values=readForm(formData,scheduleFields); const parsed=scheduleSchema.safeParse(values);
 if(!parsed.success)return {...empty,message:"Periksa kembali data rundown.",errors:fieldErrors(parsed.error),values};
 const supabase=await createClient();
 const {data:event}=await supabase.from("events").select("id,start_date,end_date").eq("id",eventId).eq("group_id",group.id).maybeSingle();
 if(!event)return {...empty,message:"Event tidak ditemukan.",values};
 if(parsed.data.item_date<event.start_date||(event.end_date&&parsed.data.item_date>event.end_date))return {...empty,message:"Tanggal kegiatan harus berada dalam rentang tanggal event.",values};
 if(parsed.data.pic_member_id){const {data:assignment}=await supabase.from("event_members").select("member_id").eq("event_id",eventId).eq("group_id",group.id).eq("member_id",parsed.data.pic_member_id).maybeSingle();if(!assignment)return {...empty,message:"PIC harus terdaftar sebagai panitia event ini terlebih dahulu.",values};}
 let sort_order=0;
 if(!itemId){const {data:last}=await supabase.from("schedule_items").select("sort_order").eq("event_id",eventId).eq("group_id",group.id).order("sort_order",{ascending:false}).limit(1).maybeSingle();sort_order=(last?.sort_order??-1)+1;}
 const payload={...parsed.data,group_id:group.id,event_id:eventId,...(!itemId?{sort_order}:{})};
 const query=itemId?supabase.from("schedule_items").update(payload).eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).select("id").maybeSingle():supabase.from("schedule_items").insert(payload).select("id").single();
 const {data,error}=await query;
 if(error||!data){console.error("[saveScheduleItem]",error?.code,error?.message);return {...empty,message:"Kegiatan rundown gagal disimpan. Coba periksa kembali datanya.",values};}
 revalidatePath("/events/"+eventId);revalidatePath(returnPath);redirect(returnPath);
}
export async function deleteScheduleItem(formData){
 const {group}=await requireGroup();const eventId=String(formData.get("event_id")||"");const itemId=String(formData.get("item_id")||"");if(!eventId||!itemId)return;const returnPath=getEventReturnPath(eventId,formData);
 const supabase=await createClient();const {error}=await supabase.from("schedule_items").delete().eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id);
 if(error)throw new Error("Kegiatan rundown gagal dihapus.");revalidatePath("/events/"+eventId);revalidatePath(returnPath);redirect(returnPath);
}
