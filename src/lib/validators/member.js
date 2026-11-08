import { z } from "zod";
export const memberSchema = z.object({
  full_name: z.string().trim().min(1, "Nama wajib diisi.").max(120, "Nama maksimal 120 karakter."),
  contact: z.string().trim().max(120, "Kontak maksimal 120 karakter.").transform((v) => v || null),
});
export const memberFields = ["full_name", "contact"];
