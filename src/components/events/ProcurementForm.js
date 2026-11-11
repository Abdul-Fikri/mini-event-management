"use client";
import { useActionState } from "react";
import { saveProcurementItem } from "@/actions/procurement";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { MoneyField } from "@/components/ui/MoneyField";
import { getTodayJakartaDate } from "@/lib/dates";

const initial={message:"",errors:{},values:{}};
const today = getTodayJakartaDate();

export default function ProcurementForm({eventId,members,categories,item=null}){
 const [state,action,pending]=useActionState(saveProcurementItem.bind(null,eventId,item?.id??null),initial);
 const value=key=>state.values?.[key]??(item?.[key]??"");
 const selectedStatus = value("status") || "not_started";
 const defaultPurchaseDate = value("purchased_date") || "";
 return <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
  <input type="hidden" name="return_to" value={`/events/${eventId}/pengadaan`}/>
  {state.message?<Alert>{state.message}</Alert>:null}
  <TextField id={"proc-name-"+(item?.id??"new")} name="name" label="Nama barang / kebutuhan" defaultValue={value("name")} error={state.errors?.name} required/>
  <TextField id={"proc-spec-"+(item?.id??"new")} name="specification" label="Spesifikasi" defaultValue={value("specification")} error={state.errors?.specification}/>
  <div className="grid gap-3 sm:grid-cols-2">
   <TextField id={"proc-qty-"+(item?.id??"new")} name="quantity" label="Jumlah" type="number" min="0.01" step="0.01" defaultValue={value("quantity")||"1"} error={state.errors?.quantity} required/>
   <TextField id={"proc-unit-"+(item?.id??"new")} name="unit" label="Satuan" hint="Contoh: pcs, kotak, meter, paket" defaultValue={value("unit")} error={state.errors?.unit}/>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <MoneyField id={"proc-est-"+(item?.id??"new")} name="est_unit_price" label="Estimasi harga satuan (Rp)" defaultValue={value("est_unit_price")} hint="Dipakai menghitung komitmen saat status Dipesan." error={state.errors?.est_unit_price}/>
   <MoneyField id={"proc-actual-"+(item?.id??"new")} name="actual_unit_price" label="Harga aktual satuan (Rp)" defaultValue={value("actual_unit_price")} hint="Wajib diisi saat status Sudah dibeli." error={state.errors?.actual_unit_price}/>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <div><label htmlFor={"proc-category-"+(item?.id??"new")} className="mb-1 block text-sm font-medium">Kategori anggaran</label><select id={"proc-category-"+(item?.id??"new")} name="category_id" defaultValue={value("category_id")} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Tanpa kategori</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{state.errors?.category_id?<p className="mt-1 text-sm text-red-700">{state.errors.category_id}</p>:null}</div>
   <TextField id={"proc-date-"+(item?.id??"new")} name="purchased_date" label="Tanggal pembelian" type="date" defaultValue={defaultPurchaseDate} hint="Jika kosong saat dibeli, otomatis memakai tanggal hari ini (WIB). " error={state.errors?.purchased_date}/>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <div><label htmlFor={"proc-pic-"+(item?.id??"new")} className="mb-1 block text-sm font-medium">PIC</label><select id={"proc-pic-"+(item?.id??"new")} name="pic_member_id" defaultValue={value("pic_member_id")} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="">Belum ditentukan</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select>{state.errors?.pic_member_id?<p className="mt-1 text-sm text-red-700">{state.errors.pic_member_id}</p>:null}</div>
   <div><label htmlFor={"proc-status-"+(item?.id??"new")} className="mb-1 block text-sm font-medium">Status pengadaan</label><select id={"proc-status-"+(item?.id??"new")} name="status" defaultValue={selectedStatus} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"><option value="not_started">Belum dimulai</option><option value="requested">Diminta</option><option value="ordered">Dipesan</option><option value="purchased">Sudah dibeli</option><option value="ready">Siap digunakan</option><option value="not_needed">Tidak diperlukan</option></select></div>
  </div>
  <TextField id={"proc-supplier-"+(item?.id??"new")} name="supplier" label="Supplier / toko" defaultValue={value("supplier")} error={state.errors?.supplier}/>
  <TextField id={"proc-notes-"+(item?.id??"new")} name="notes" label="Catatan" multiline defaultValue={value("notes")} error={state.errors?.notes}/>
  <Button type="submit" pending={pending} pendingText="Menyimpan…">{item?"Simpan perubahan":"Tambah kebutuhan"}</Button>
 </form>;
}
