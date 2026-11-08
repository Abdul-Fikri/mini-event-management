"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { procurementFields,procurementSchema } from "@/lib/validators/procurement";
import { fieldErrors,readForm } from "@/lib/validators/helpers";
const empty={message:"",errors:{},values:{}};
export async function saveProcurementItem(eventId,itemId,_prev,formData){
 const {group}=await requireGroup();
 const values=readForm(formData,procurementFields);
 const parsed=procurementSchema.safeParse(values);
 if(!parsed.success)return {...empty,message:"Periksa kembali data kebutuhan perlengkapan.",errors:fieldErrors(parsed.error),values};
 const supabase=await createClient();
 const {data:event}=await supabase.from("events").select("id").eq("id",eventId).eq("group_id",group.id).maybeSingle();
 if(!event)return {...empty,message:"Event tidak ditemukan.",values};
 if(parsed.data.pic_member_id){
  const {data:member}=await supabase.from("members").select("id").eq("id",parsed.data.pic_member_id).eq("group_id",group.id).maybeSingle();
  if(!member)return {...empty,message:"PIC tidak ditemukan pada grup ini.",values};
 }
 const payload={...parsed.data,group_id:group.id,event_id:eventId};
 const query=itemId
  ?supabase.from("procurement_items").update(payload).eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).select("id").maybeSingle()
  :supabase.from("procurement_items").insert(payload).select("id").single();
 const {data,error}=await query;
 if(error||!data){console.error("[saveProcurementItem]",error?.code,error?.message);return {...empty,message:"Data perlengkapan gagal disimpan. Periksa kembali datanya.",values};}
 revalidatePath("/events/"+eventId);redirect("/events/"+eventId);
}
export async function deleteProcurementItem(formData){
 const {group}=await requireGroup();
 const eventId=String(formData.get("event_id")||"");
 const itemId=String(formData.get("item_id")||"");
 if(!eventId||!itemId)return;
 const supabase=await createClient();
 const {error}=await supabase.from("procurement_items").delete().eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id);
 if(error)throw new Error("Data perlengkapan gagal dihapus.");
 revalidatePath("/events/"+eventId);redirect("/events/"+eventId);
}
