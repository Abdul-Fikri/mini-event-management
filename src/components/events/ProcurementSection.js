import { deleteProcurementItem } from "@/actions/procurement";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import ProcurementForm from "@/components/events/ProcurementForm";
const currency=value=>value==null?"—":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
const statusLabel={not_started:"Belum dimulai",requested:"Diminta / dipesan",purchased:"Sudah dibeli",ready:"Siap digunakan",not_needed:"Tidak diperlukan"};
export default function ProcurementSection({eventId,items,members}){
 const memberById=new Map(members.map(m=>[m.id,m]));
 const active=items.filter(i=>i.status!=="not_needed");
 const estimate=active.reduce((sum,i)=>sum+(i.est_unit_price??0)*Number(i.quantity),0);
 const actual=active.reduce((sum,i)=>sum+(i.actual_unit_price??0)*Number(i.quantity),0);
 const count={not_started:0,requested:0,purchased:0,ready:0,not_needed:0};
 items.forEach(i=>{count[i.status]=(count[i.status]??0)+1;});
 return <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
  <div><h2 className="text-lg font-semibold">Manajemen perlengkapan</h2><p className="text-sm text-zinc-600">Catat kebutuhan barang, estimasi dan harga aktual, supplier, serta progres pengadaannya.</p></div>
  <div className="grid gap-2 sm:grid-cols-2"><div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total estimasi pengadaan</p><p className="mt-1 text-lg font-semibold">{currency(estimate)}</p></div><div className="rounded-md bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total harga aktual tercatat</p><p className="mt-1 text-lg font-semibold">{currency(actual)}</p></div></div>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{Object.entries(statusLabel).map(([key,label])=><div key={key} className="rounded-md border border-zinc-100 p-2"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{count[key]}</p></div>)}</div>
  {items.length?<div className="space-y-3">{items.map(item=><article key={item.id} className="rounded-lg border border-zinc-200 p-4">
   <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1">
    <h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-zinc-600">{Number(item.quantity)} {item.unit??"unit"} · {statusLabel[item.status]}</p>
    {item.specification?<p className="mt-1 text-sm text-zinc-600">{item.specification}</p>:null}
    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Estimasi total</dt><dd className="font-medium">{currency(item.est_unit_price==null?null:Number(item.est_unit_price)*Number(item.quantity))}</dd></div><div><dt className="text-zinc-500">Aktual total</dt><dd className="font-medium">{currency(item.actual_unit_price==null?null:Number(item.actual_unit_price)*Number(item.quantity))}</dd></div><div><dt className="text-zinc-500">PIC</dt><dd>{memberById.get(item.pic_member_id)?.full_name??"Belum ditentukan"}</dd></div><div><dt className="text-zinc-500">Supplier</dt><dd>{item.supplier??"—"}</dd></div></dl>
    {item.notes?<p className="mt-2 whitespace-pre-wrap text-xs text-zinc-500">Catatan: {item.notes}</p>:null}
   </div><form action={deleteProcurementItem}><input type="hidden" name="event_id" value={eventId}/><input type="hidden" name="item_id" value={item.id}/><ConfirmDeleteButton message={'Hapus kebutuhan "'+item.name+'"?'}>Hapus</ConfirmDeleteButton></form></div>
   <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit kebutuhan / perbarui status</summary><div className="mt-3"><ProcurementForm eventId={eventId} members={members} item={item}/></div></details>
  </article>)}</div>:<p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada kebutuhan perlengkapan untuk event ini.</p>}
  <div className="border-t border-zinc-100 pt-4"><h3 className="mb-3 font-medium">Tambah kebutuhan</h3><ProcurementForm eventId={eventId} members={members}/></div>
 </section>;
}
