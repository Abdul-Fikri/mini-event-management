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
const procurementTypes=new Set(["purchase","borrow","inventory"]);

function procurementPaths(eventId,returnPath){
 revalidatePath("/events/"+eventId);
 revalidatePath("/events/"+eventId+"/pengadaan");
 revalidatePath("/events/"+eventId+"/keuangan");
 if(returnPath)revalidatePath(returnPath);
}

function validateTypeAndExpense(parsed,hasLinkedExpense,values){
 const isPurchase=parsed.procurement_type==="purchase";
 if(!isPurchase){
  if(hasLinkedExpense)return {...empty,message:"Item yang sudah terhubung ke Keuangan tidak dapat diubah menjadi Peminjaman atau Inventaris.",values};
  if(["ordered","purchased"].includes(parsed.status))return {...empty,message:"Status Dipesan/Sudah dibeli hanya berlaku untuk jenis Pembelian.",errors:{status:"Pilih status yang sesuai dengan jenis pengadaan."},values};
  return null;
 }

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
 if(!procurementTypes.has(parsed.data.procurement_type))return {...empty,message:"Jenis pengadaan tidak valid.",values};

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
  const {data,error:existingError}=await supabase.from("procurement_items").select("id,status,purchased_date,actual_unit_price,procurement_type,returned_at").eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
  if(existingError){
   if(existingError.code==="42703"||existingError.code==="PGRST204")return {...empty,message:"Kolom jenis pengadaan belum tersedia. Terapkan migration 20261126_procurement_types_and_loans.sql terlebih dahulu.",values};
   return {...empty,message:"Gagal memuat data pengadaan yang akan diedit.",values};
  }
  if(!data)return {...empty,message:"Data pengadaan tidak ditemukan.",values};
  existingItem=data;
  const {data:linked,error:linkedError}=await supabase.from("transactions").select("id").eq("procurement_item_id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
  if(linkedError)return {...empty,message:"Gagal memeriksa hubungan transaksi pengadaan. Pastikan migration integrasi Pengadaan–Keuangan sudah diterapkan.",values};
  hasLinkedExpense=Boolean(linked);
  if(hasLinkedExpense&&!purchasedStatuses.has(parsed.data.status)){
   return {...empty,message:"Pembelian ini sudah tercatat sebagai pengeluaran. Status tidak dapat dikembalikan ke Belum dimulai, Diminta, Dipesan, atau Tidak diperlukan; gunakan Sudah dibeli atau Siap digunakan.",values};
  }
  if(existingItem?.returned_at&&parsed.data.procurement_type!=="borrow"){
   return {...empty,message:"Item yang sudah ditandai dikembalikan tidak dapat diubah jenisnya.",values};
  }
 }

 const expenseError=validateTypeAndExpense(parsed.data,hasLinkedExpense,values);
 if(expenseError)return expenseError;

 const isPurchase=parsed.data.procurement_type==="purchase";
 const isBorrow=parsed.data.procurement_type==="borrow";
 const transitioningToPurchased=isPurchase&&purchasedStatuses.has(parsed.data.status)&&(!existingItem||!purchasedStatuses.has(existingItem.status)||existingItem.procurement_type!=="purchase");
 const payload={
  ...parsed.data,
  est_unit_price:isPurchase?parsed.data.est_unit_price:null,
  actual_unit_price:isPurchase?parsed.data.actual_unit_price:null,
  category_id:isPurchase?parsed.data.category_id:null,
  purchased_date:isPurchase?(parsed.data.purchased_date||existingItem?.purchased_date||(transitioningToPurchased?getTodayJakartaDate():null)):null,
  expected_return_date:isBorrow?parsed.data.expected_return_date:null,
  returned_at:isBorrow?(existingItem?.returned_at??null):null,
  group_id:group.id,
  event_id:eventId
 };
 const query=itemId
  ?supabase.from("procurement_items").update(payload).eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).select("id").maybeSingle()
  :supabase.from("procurement_items").insert(payload).select("id").single();
 const {data,error}=await query;
 if(error||!data){
  console.error("[saveProcurementItem]",error?.code,error?.message);
  if(error?.code==="42703"||error?.code==="PGRST204")return {...empty,message:"Kolom jenis pengadaan belum tersedia. Terapkan migration 20261126_procurement_types_and_loans.sql terlebih dahulu.",values};
  if(error?.code==="23514")return {...empty,message:"Data pengadaan tidak sesuai jenisnya. Periksa jenis, status, dan harga.",errors:{status:"Periksa status dan data harga sesuai jenis pengadaan."},values};
  return {...empty,message:"Data perlengkapan gagal disimpan. Periksa kembali datanya.",values};
 }
 procurementPaths(eventId,returnPath);
 redirect(returnPath);
}

export async function markProcurementReturned(formData){
 const {group}=await requireGroup();
 const eventId=String(formData.get("event_id")||"");
 const itemId=String(formData.get("item_id")||"");
 if(!eventId||!itemId)return;
 const returnPath=getEventReturnPath(eventId,formData);
 const supabase=await createClient();
 const {data:item,error:readError}=await supabase.from("procurement_items").select("id,procurement_type,status,returned_at").eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
 if(readError||!item)redirect(`${returnPath}?procurement_error=item_not_found`);
 if(item.procurement_type!=="borrow"||item.status!=="ready")redirect(`${returnPath}?procurement_error=not_returnable`);
 if(item.returned_at)redirect(returnPath);
 const {error}=await supabase.from("procurement_items").update({returned_at:new Date().toISOString()}).eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).is("returned_at",null);
 if(error){
  console.error("[markProcurementReturned]",error.code,error.message);
  redirect(`${returnPath}?procurement_error=return_failed`);
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
 const {data:item,error:itemError}=await supabase.from("procurement_items").select("id,procurement_type,status,actual_unit_price,purchased_date").eq("id",itemId).eq("event_id",eventId).eq("group_id",group.id).maybeSingle();
 if(itemError)redirect(`${returnPath}?procurement_error=sync_failed`);
 if(!item)redirect(`${returnPath}?procurement_error=item_not_found`);
 if(item.procurement_type!=="purchase")redirect(`${returnPath}?procurement_error=not_purchase`);
 if(!purchasedStatuses.has(item.status))redirect(`${returnPath}?procurement_error=not_purchased`);
 if(!item.actual_unit_price||item.actual_unit_price<=0)redirect(`${returnPath}?procurement_error=missing_actual_price`);
 if(!item.purchased_date)redirect(`${returnPath}?procurement_error=missing_purchase_date`);
 const {error:syncError}=await supabase.rpc("upsert_procurement_expense_for_item",{
  p_item_id:itemId,
  p_event_id:eventId,
  p_group_id:group.id
 });
 if(syncError){
  console.error("[syncProcurementItemToFinance:rpc]",syncError.code,syncError.message);
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