import { z } from "zod";
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");
const optionalText = (max, label) => z.string().trim().max(max, `${label} maksimal ${max} karakter.`).transform((v) => v || null);
export const eventSchema = z.object({
  name: z.string().trim().min(1, "Nama event wajib diisi.").max(160),
  description: optionalText(2000, "Deskripsi"),
  category: optionalText(60, "Kategori"),
  start_date: date,
  end_date: z.union([date, z.literal("")]).transform((v) => v || null),
  location: optionalText(200, "Lokasi"),
  status: z.enum(["draft", "planned", "ongoing", "completed", "cancelled"]),
  coordinator_id: z.union([z.string().uuid("Koordinator tidak valid."), z.literal("")]).transform((v) => v || null),
  target_budget: z.union([z.string(), z.literal("")]).transform((v) => v === "" ? null : Number(v)).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable()),
}).refine((v) => !v.end_date || v.end_date >= v.start_date, { path: ["end_date"], message: "Tanggal selesai tidak boleh sebelum tanggal mulai." });
export const eventFields = ["name","description","category","start_date","end_date","location","status","coordinator_id","target_budget"];
