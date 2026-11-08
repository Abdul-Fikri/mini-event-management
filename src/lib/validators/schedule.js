import { z } from "zod";
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Tanggal tidak valid.");
const optionalText=(max,label)=>z.string().trim().max(max,label+" maksimal "+max+" karakter.").transform(v=>v||null);
const optionalTime=z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,"Format waktu tidak valid."),z.literal("")]).transform(v=>v||null);
export const scheduleSchema=z.object({
 title:z.string().trim().min(1,"Nama kegiatan wajib diisi.").max(160,"Nama kegiatan maksimal 160 karakter."),
 item_date:date,start_time:optionalTime,end_time:optionalTime,location:optionalText(200,"Lokasi"),
 pic_member_id:z.union([z.string().uuid("PIC tidak valid."),z.literal("")]).transform(v=>v||null),
 notes:optionalText(1000,"Catatan")
}).refine(v=>!v.start_time||!v.end_time||v.end_time>=v.start_time,{path:["end_time"],message:"Waktu selesai tidak boleh sebelum waktu mulai."});
export const scheduleFields=["title","item_date","start_time","end_time","location","pic_member_id","notes"];
