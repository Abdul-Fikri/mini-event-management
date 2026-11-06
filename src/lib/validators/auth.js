import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi.")
  .email("Format email tidak valid.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi."),
});

export const registerSchema = z
  .object({
    email,
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .max(72, "Password maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });
