import { z } from "zod";
import { rupiahInteger } from "@/lib/validators/money";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");
const optionalText = (max, label) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter.`).transform((v) => v || null);

const baseEventSchema = z.object({
  name: z.string().trim().min(1, "Nama event wajib diisi.").max(160),
  description: optionalText(2000, "Deskripsi"),
  category: optionalText(60, "Kategori"),
  start_date: date,
  end_date: z.union([date, z.literal("")]).transform((v) => v || null),
  location: optionalText(200, "Lokasi"),
  status: z.enum(["draft", "planned", "ongoing", "completed", "cancelled"]),
  coordinator_id: z.union([z.string().uuid("Koordinator tidak valid."), z.literal("")]).transform((v) => v || null),
  target_budget: z.union([rupiahInteger, z.literal("")]).transform((v) => v === "" ? null : v).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable()),
}).refine((v) => !v.end_date || v.end_date >= v.start_date, {
  path: ["end_date"],
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
});

// Tetap diekspor untuk pemakaian validasi dasar yang tidak membutuhkan konteks tanggal.
export const eventSchema = baseEventSchema;

export function createEventSchema({ today, existingEvent = null }) {
  return baseEventSchema.superRefine((values, ctx) => {
    const startDateChanged =
      !existingEvent || values.start_date !== existingEvent.start_date;

    if (startDateChanged && values.start_date < today) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "Tanggal mulai event tidak boleh sebelum hari ini.",
      });
    }

    const previousEndDate = existingEvent?.end_date ?? null;
    const endDateChanged =
      !existingEvent || values.end_date !== previousEndDate;

    if (values.end_date && endDateChanged && values.end_date < today) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Tanggal selesai event tidak boleh sebelum hari ini.",
      });
    }
  });
}

export const eventFields = [
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
