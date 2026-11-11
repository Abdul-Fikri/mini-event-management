import { z } from "zod";
import { rupiahInteger } from "@/lib/validators/money";

const optionalText=(max,label)=>z.string().trim().max(max,label+" maksimal "+max+" karakter.").transform(v=>v||null);
const optionalMoney=z.union([rupiahInteger,z.literal("")]).transform(v=>v===""?null:v).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable());
const uuidOrEmpty=z.union([z.string().uuid("Pilihan tidak valid."),z.literal("")]).transform(v=>v||null);
const optionalDate=z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Tanggal pembelian tidak valid."),z.literal("")]).transform(v=>v||null);

export const procurementSchema=z.object({
 name:z.string().trim().min(1,"Nama barang wajib diisi.").max(160,"Nama barang maksimal 160 karakter."),
 specification:optionalText(500,"Spesifikasi"),
 quantity:z.string().regex(/^\d+(?:\.\d{1,2})?$/,"Jumlah harus lebih dari 0 (maksimal 2 angka desimal).").transform(Number).pipe(z.number().positive().max(9999999999.99)),
 unit:optionalText(30,"Satuan"),
 est_unit_price:optionalMoney,
 actual_unit_price:optionalMoney,
 category_id:uuidOrEmpty,
 purchased_date:optionalDate,
 pic_member_id:z.union([z.string().uuid("PIC tidak valid."),z.literal("")]).transform(v=>v||null),
 status:z.enum(["not_started","requested","ordered","purchased","ready","not_needed"]),
 supplier:optionalText(120,"Supplier"),
 notes:optionalText(1000,"Catatan")
});

export const procurementFields=["name","specification","quantity","unit","est_unit_price","actual_unit_price","category_id","purchased_date","pic_member_id","status","supplier","notes"];
