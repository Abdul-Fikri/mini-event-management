import { z } from "zod";

// Terima angka biasa (500000) atau format rupiah Indonesia (500.000),
// lalu normalisasi menjadi number sebelum dipakai oleh Server Action.
export const rupiahInteger = z
  .string()
  .regex(/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/, "Nominal harus berupa bilangan bulat.")
  .transform(value => Number(value.replace(/\./g, "")));
