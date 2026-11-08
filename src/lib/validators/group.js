import { z } from "zod";
import { optionalText } from "@/lib/validators/helpers";

// Batas panjang mengikuti CHECK constraint di supabase/schema.sql (tabel groups).
export const groupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama grup wajib diisi.")
    .max(120, "Nama grup maksimal 120 karakter."),
  category: optionalText(60, "Kategori"),
  description: optionalText(1000, "Deskripsi"),
});
