import { z } from "zod";
import { rupiahInteger } from "@/lib/validators/money";

const date = z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, "Tanggal tidak valid.");
const optionalDate = z.union([date, z.literal("")]).transform((value) => value || null);
const optionalText = (max, label) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter.`).transform((value) => value || null);

const baseEventSchema = z.object({
  name: z.string().trim().min(1, "Nama event wajib diisi.").max(160),
  description: optionalText(2000, "Deskripsi"),
  category: optionalText(60, "Kategori"),
  start_date: date,
  end_date: optionalDate,
  planning_start_date: optionalDate,
  preparation_start_date: optionalDate,
  evaluation_end_date: optionalDate,
  status_mode: z.enum(["automatic", "manual"]).default("automatic"),
  status: z.enum([
    "draft",
    "planned",
    "planning",
    "preparation",
    "ongoing",
    "evaluation",
    "completed",
    "cancelled",
  ]),
  location: optionalText(200, "Lokasi"),
  coordinator_id: z.union([z.string().uuid("Koordinator tidak valid."), z.literal("")]).transform((value) => value || null),
  target_budget: z.union([rupiahInteger, z.literal("")]).transform((value) => value === "" ? null : value).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable()),
});

function validateTimeline(values, ctx) {
  if (Boolean(values.planning_start_date) !== Boolean(values.preparation_start_date)) {
    ctx.addIssue({
      code: "custom",
      path: ["preparation_start_date"],
      message: "Isi tanggal mulai perencanaan dan persiapan sekaligus, atau kosongkan keduanya.",
    });
  } else if (
    values.planning_start_date &&
    values.preparation_start_date &&
    !(
      values.planning_start_date < values.preparation_start_date &&
      values.preparation_start_date < values.start_date
    )
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["preparation_start_date"],
      message: "Urutan tanggal harus: perencanaan, persiapan, lalu mulai event.",
    });
  }

  const eventEndDate = values.end_date || values.start_date;
  if (values.evaluation_end_date && values.evaluation_end_date <= eventEndDate) {
    ctx.addIssue({
      code: "custom",
      path: ["evaluation_end_date"],
      message: "Tanggal akhir evaluasi harus setelah tanggal selesai event.",
    });
  }

  if (values.end_date && values.end_date < values.start_date) {
    ctx.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
    });
  }
}

// Tetap diekspor untuk pemakaian validasi dasar yang tidak membutuhkan konteks tanggal.
export const eventSchema = baseEventSchema.superRefine(validateTimeline);

export function createEventSchema({ today, existingEvent = null }) {
  return baseEventSchema.superRefine((values, ctx) => {
    validateTimeline(values, ctx);

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
  "planning_start_date",
  "preparation_start_date",
  "evaluation_end_date",
  "status_mode",
  "status",
  "location",
  "coordinator_id",
  "target_budget",
];
