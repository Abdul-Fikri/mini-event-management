"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { taskFields,taskSchema } from "@/lib/validators/task";
import { fieldErrors,readForm } from "@/lib/validators/helpers";
import { getEventReturnPath } from "@/lib/events/return-path";
const empty={message:"",errors:{},values:{}};
export async function saveTask(eventId,taskId,_prev,formData){
 const {group}=await requireGroup();
 const returnPath=getEventReturnPath(eventId,formData);
 const values=readForm(formData,taskFields);
 const parsed=taskSchema.safeParse(values);
 if(!parsed.success)return {...empty,message:"Periksa kembali data tugas.",errors:fieldErrors(parsed.error),values};
 const supabase=await createClient();
 const {data:event}=await supabase.from("events").select("id").eq("id",eventId).eq("group_id",group.id).maybeSingle();
 if(!event)return {...empty,message:"Event tidak ditemukan.",values};
 if(parsed.data.assigned_to){
  const {data:assignment}=await supabase.from("event_members").select("member_id").eq("event_id",eventId).eq("group_id",group.id).eq("member_id",parsed.data.assigned_to).maybeSingle();
  if(!assignment)return {...empty,message:"Penanggung jawab harus terdaftar sebagai panitia event ini terlebih dahulu.",values};
 }
 const payload={...parsed.data,group_id:group.id,event_id:eventId};
 const query=taskId
  ?supabase.from("tasks").update(payload).eq("id",taskId).eq("event_id",eventId).eq("group_id",group.id).select("id").maybeSingle()
  :supabase.from("tasks").insert(payload).select("id").single();
 const {data,error}=await query;
 if(error||!data){console.error("[saveTask]",error?.code,error?.message);return {...empty,message:"Tugas gagal disimpan. Periksa kembali datanya.",values};}
 revalidatePath("/events/"+eventId);revalidatePath(returnPath);redirect(returnPath);
}
const TASK_STATUSES = new Set(["todo", "in_progress", "done", "blocked"]);

export async function updateTaskStatus(eventId, taskId, status) {
  const { group } = await requireGroup();
  if (!TASK_STATUSES.has(status)) {
    return { success: false, message: "Status tugas tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("event_id", eventId)
    .eq("group_id", group.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("[updateTaskStatus]", error?.code, error?.message);
    return { success: false, message: "Status tugas gagal diperbarui." };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/tugas`);
  revalidatePath(`/events/${eventId}/tugas/all`);
  return { success: true, message: "Status tugas diperbarui." };
}

export async function deleteTask(formData){
 const {group}=await requireGroup();
 const eventId=String(formData.get("event_id")||"");
 const taskId=String(formData.get("task_id")||"");
 if(!eventId||!taskId)return;
 const returnPath=getEventReturnPath(eventId,formData);
 const supabase=await createClient();
 const {error}=await supabase.from("tasks").delete().eq("id",taskId).eq("event_id",eventId).eq("group_id",group.id);
 if(error)throw new Error("Tugas gagal dihapus.");
 revalidatePath("/events/"+eventId);revalidatePath(returnPath);redirect(returnPath);
}
