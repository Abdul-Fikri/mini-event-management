import { z } from "zod";
const optionalText=(max,label)=>z.string().trim().max(max,label+" maksimal "+max+" karakter.").transform(v=>v||null);
const date=z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Tanggal tidak valid."),z.literal("")]).transform(v=>v||null);
export const taskSchema=z.object({
 title:z.string().trim().min(1,"Nama tugas wajib diisi.").max(160,"Nama tugas maksimal 160 karakter."),
 description:optionalText(2000,"Deskripsi"),
 assigned_to:z.union([z.string().uuid("PIC tidak valid."),z.literal("")]).transform(v=>v||null),
 due_date:date,
 priority:z.enum(["low","medium","high"]),
 status:z.enum(["todo","in_progress","done","blocked"]),
 notes:optionalText(1000,"Catatan")
});
export const taskFields=["title","description","assigned_to","due_date","priority","status","notes"];
