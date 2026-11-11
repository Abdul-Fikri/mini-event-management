"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { procurementFields,procurementSchema } from "@/lib/validators/procurement";
import { fieldErrors,readForm } from "@/lib/validators/helpers";
import { getEventReturnPath } from "@/lib/events/return-path";
import { getTodayJakartaDate } from "@/lib/dates";

const empty={message:"",errors:{},values:{}};
const purchasedStatuses=new Set(["purchased","ready"]);

function procurementPaths(eventId,returnPath){
 revalidatePath("/events/"+eventId);
 revalidatePath("/events/"+eventId+"/pengadaan");
 revalidatePath("/events/"+eventId+"/keuangan");
 if(returnPath)revalidatePath(returnPath);
}

function validateExpenseData(parsed,hasLinkedExpense,values){
 const shouldSync=purchasedStatuses.has(parsed.status)||hasLinkedExpense;
 if(!shouldSync)return null;
 if(!parsed.actual_unit_price||parsed.actual_unit_price<=0){
  return {...empty,message:"Isi harga aktual lebih dari Rp0 sebelum item berstatus Sudah dibeli atau Siap digunakan.",errors:{actual_unit_price:"Harga aktual wajib lebih dari Rp0 agar tercatat di Keuangan."},values};
 }
 const total=Math.round(parsed.actual_unit_price*parsed.quantity);
 if(!Number.isSafeInteger(total)||total<=0){
  return {...empty,message:"Total pembelian tidak valid. Periksa jumlah dan harga aktual.",errors:{actual_unit_price:"Total pembelian harus lebih dari Rp0 dan tidak melebihi batas nominal."},values};
 }
 return null;
}

export async function saveProcurementItem(eventId,itemId,_prev,formData){
 const {group}=await requireGroup();
 const returnPath=getEventReturnPath(eventId,formData);
 const values=readForm(formData,procurementFields);
 const parsed=procurementSchema.safeParse(values);
 if(!parsed.success)return {...empty,message:"Periksa kembali data kebutuhan perlengkapan.",errors:fieldErrors(parsed.error),values};

 const supabase=await createClient();
 const {data:event}=await supabase.from("events").select("id").eq("id",eventId).eq("group_id",group.id).maybeSingle();
 if(!event)return {...empty,message:"Event tidak ditemukan.",values};

 if(parsed.data.pic_member_id){
  const {data:assignment}=await supabase.from("event_members").select("member_id").eq("event_id",eventId).eq("group_id",group.id).eq("member_id",parsed.data.pic_member_id).maybeSingle();
  if(!assignment)return {...empty,message:"PIC harus terdaftar sebagai panitia event ini terlebih dahulu.",values};
 }
 if(parsed.data.category_id){
  const {data:category}=await supabase.from("budget_categories").select("id").eq("id",parsed.data.category_id).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
  if(!category)return {...empty,message:"Kategori anggaran tidak valid untuk event ini.",errors:{category_id:"Pilih kategori dari event ini."},values};
 }

 let existingItem=null;
 let hasLinkedExpense=false;
 if(itemId){
  const {data}=await supabase.from("procurement_items").select("id,status,purchased_date,actual_unit_price").eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
  if(!data)return {...empty,message:"Data pengadaan tidak ditemukan.",values};
  existingItem=data;
  const {data:linked,error:linkedError}=await supabase.from("transactions").select("id").eq("procurement_item_id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
  if(linkedError)return {...empty,message:"Gagal memeriksa hubungan transaksi pengadaan. Pastikan migration integrasi Pengadaan–Keuangan sudah diterapkan.",values};
  hasLinkedExpense=Boolean(linked);
 }

 const expenseError=validateExpenseData(parsed.data,hasLinkedExpense,values);
 if(expenseError)return expenseError;

 const shouldSync=purchasedStatuses.has(parsed.data.status)||hasLinkedExpense;
 const payload={
  ...parsed.data,
  purchased_date:shouldSync?(parsed.data.purchased_date||existingItem?.purchased_date||getTodayJakartaDate()):parsed.data.purchased_date,
  group_id:group.id,
  event_id:eventId
 };
 const query=itemId
  ?supabase.from("procurement_items").update(payload).eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).select("id").maybeSingle()
  :supabase.from("procurement_items").insert(payload).select("id").single();
 const {data,error}=await query;
 if(error||!data){
  console.error("[saveProcurementItem]",error?.code,error?.message);
  if(error?.code==="42703"||error?.code==="PGRST204")return {...empty,message:"Kolom integrasi belum tersedia. Terapkan migration 20261111_procurement_finance_integration.sql terlebih dahulu.",values};
  if(error?.code==="23514")return {...empty,message:"Pembelian gagal dicatat. Pastikan harga aktual lebih dari Rp0 dan jumlahnya valid.",errors:{actual_unit_price:"Periksa harga aktual dan jumlah pembelian."},values};
  return {...empty,message:"Data perlengkapan gagal disimpan. Periksa kembali datanya.",values};
 }
 procurementPaths(eventId,returnPath);
 redirect(returnPath);
}

export async function syncProcurementItemToFinance(formData){
 const {group}=await requireGroup();
 const eventId=String(formData.get("event_id")||"");
 const itemId=String(formData.get("item_id")||"");
 if(!eventId||!itemId)return;
 const returnPath=getEventReturnPath(eventId,formData);
 const supabase=await createClient();
 const {data:item,error:itemError}=await supabase.from("procurement_items").select("id,status,actual_unit_price,purchased_date").eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
 if(itemError)redirect(`${returnPath}?procurement_error=sync_failed`);
 if(!item)redirect(`${returnPath}?procurement_error=item_not_found`);
 if(!purchasedStatuses.has(item.status))redirect(`${returnPath}?procurement_error=not_purchased`);
 if(!item.actual_unit_price||item.actual_unit_price<=0)redirect(`${returnPath}?procurement_error=missing_actual_price`);
 const {error}=await supabase.from("procurement_items").update({purchased_date:item.purchased_date||getTodayJakartaDate()}).eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id);
 if(error){
  console.error("[syncProcurementItemToFinance]",error.code,error.message);
  redirect(`${returnPath}?procurement_error=sync_failed`);
 }
 procurementPaths(eventId,returnPath);
 redirect(returnPath);
}

export async function deleteProcurementItem(formData){
 const {group}=await requireGroup();
 const eventId=String(formData.get("event_id")||"");
 const itemId=String(formData.get("item_id")||"");
 if(!eventId||!itemId)return;
 const returnPath=getEventReturnPath(eventId,formData);
 const supabase=await createClient();
 const {error}=await supabase.from("procurement_items").delete().eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id);
 if(error)throw new Error("Data perlengkapan gagal dihapus.");
 procurementPaths(eventId,returnPath);
 redirect(returnPath);
}
