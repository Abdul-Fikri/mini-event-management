import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const eventSchema = z
  .object({
    name: z.string().trim().min(1, "Nama event wajib diisi.").max(160, "Nama event maksimal 160 karakter."),
    description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter.").nullable(),
    category: z.string().trim().max(60, "Kategori maksimal 60 karakter.").nullable(),
    start_date: z.string().regex(datePattern, "Tanggal mulai tidak valid."),
    end_date: z.string().regex(datePattern, "Tanggal selesai tidak valid.").nullable(),
    location: z.string().trim().max(200, "Lokasi maksimal 200 karakter.").nullable(),
    status: z.enum(["draft", "planned", "ongoing", "completed", "cancelled"]),
    coordinator_id: z.string().uuid("Koordinator tidak valid.").nullable(),
    target_budget: z.number().int().min(0, "Anggaran tidak boleh negatif.").max(Number.MAX_SAFE_INTEGER, "Anggaran terlalu besar.").nullable(),
  })
  .refine((data) => !data.end_date || data.end_date >= data.start_date, {
    path: ["end_date"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

export const eventFormFields = [
  "name",
  "description",
  "category",
  "start_date",
  "end_date",
  "location",
  "status",
  "coordinator_id",
  "target_budget",
];
