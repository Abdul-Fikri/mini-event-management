import { z } from "zod";

const optionalText = (max, label) => z.string().trim().max(max, label + " maksimal " + max + " karakter.").transform(v => v || null);
const money = z.string().regex(/^\\d+$/, "Nominal harus berupa bilangan bulat.").transform(Number).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER));
const positiveMoney = z.string().regex(/^[1-9]\\d*$/, "Nominal harus lebih dari 0 dan berupa bilangan bulat.").transform(Number).pipe(z.number().int().min(1).max(Number.MAX_SAFE_INTEGER));
const uuidOrEmpty = z.union([z.string().uuid("Pilihan tidak valid."), z.literal("")]).transform(v => v || null);
const date = z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, "Tanggal transaksi wajib diisi.");

export const budgetCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(80, "Nama kategori maksimal 80 karakter."),
  planned_amount: money,
});
export const budgetCategoryFields = ["name", "planned_amount"];

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  trx_date: date,
  description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(200, "Deskripsi maksimal 200 karakter."),
  amount: positiveMoney,
  category_id: uuidOrEmpty,
  recorded_by: uuidOrEmpty,
  reference: optionalText(200, "Referensi"),
});
export const transactionFields = ["type", "trx_date", "description", "amount", "category_id", "recorded_by", "reference"];
