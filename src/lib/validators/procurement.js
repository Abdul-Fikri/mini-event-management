import { z } from "zod";
const optionalText=(max,label)=>z.string().trim().max(max,label+" maksimal "+max+" karakter.").transform(v=>v||null);
const optionalMoney=z.union([z.string().regex(/^\\d+$/,"Harga harus berupa bilangan bulat."),z.literal("")]).transform(v=>v===""?null:Number(v)).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable());
export const procurementSchema=z.object({
 name:z.string().trim().min(1,"Nama barang wajib diisi.").max(160,"Nama barang maksimal 160 karakter."),
 specification:optionalText(500,"Spesifikasi"),
 quantity:z.string().regex(/^\\d+(?:\\.\\d{1,2})?$/,"Jumlah harus lebih dari 0 (maksimal 2 angka desimal).").transform(Number).pipe(z.number().positive().max(9999999999.99)),
 unit:optionalText(30,"Satuan"),
 est_unit_price:optionalMoney,
 actual_unit_price:optionalMoney,
 pic_member_id:z.union([z.string().uuid("PIC tidak valid."),z.literal("")]).transform(v=>v||null),
 status:z.enum(["not_started","requested","purchased","ready","not_needed"]),
 supplier:optionalText(120,"Supplier"),
 notes:optionalText(1000,"Catatan")
});
export const procurementFields=["name","specification","quantity","unit","est_unit_price","actual_unit_price","pic_member_id","status","supplier","notes"];
