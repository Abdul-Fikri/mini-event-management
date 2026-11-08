import { z } from "zod";

// Mengambil nilai form sebagai string (null/File menjadi string kosong).
export function readForm(formData, fields) {
  const values = {};
  for (const field of fields) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

// Mengubah error Zod menjadi { namaField: "pesan pertama" }.
export function fieldErrors(error) {
  const errors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

// Teks opsional: dipangkas, string kosong menjadi null (cocok dengan kolom nullable).
export function optionalText(max, label) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .transform((value) => (value === "" ? null : value));
}
