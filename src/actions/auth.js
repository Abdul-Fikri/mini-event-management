"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { fieldErrors, readForm } from "@/lib/validators/helpers";

function failure(message, values = {}, errors = {}) {
  return { ok: false, message, errors, values };
}

const SIGN_UP_ERRORS = {
  user_already_exists: "Email ini sudah terdaftar. Silakan masuk.",
  email_exists: "Email ini sudah terdaftar. Silakan masuk.",
  weak_password: "Password terlalu lemah. Gunakan kombinasi yang lebih kuat.",
  email_address_invalid: "Alamat email tidak dapat digunakan.",
  over_email_send_rate_limit:
    "Terlalu banyak permintaan email. Tunggu beberapa saat lalu coba lagi.",
  signup_disabled: "Pendaftaran sedang dinonaktifkan.",
};

export async function register(prevState, formData) {
  const raw = readForm(formData, ["email", "password", "confirmPassword"]);
  // Password tidak pernah dikembalikan ke browser.
  const values = { email: raw.email };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return failure(
      "Periksa kembali isian Anda.",
      values,
      fieldErrors(parsed.error)
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return failure(
      SIGN_UP_ERRORS[error.code] ?? "Pendaftaran gagal. Silakan coba lagi.",
      values
    );
  }

  // Konfirmasi email nonaktif: sesi langsung aktif.
  if (data.session) {
    redirect("/onboarding");
  }

  // Konfirmasi email aktif: pengguna harus membuka email dulu.
  return {
    ok: true,
    message:
      "Pendaftaran berhasil. Periksa email Anda untuk konfirmasi, lalu masuk.",
    errors: {},
    values: {},
  };
}

export async function login(prevState, formData) {
  const raw = readForm(formData, ["email", "password"]);
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return failure(
      "Periksa kembali isian Anda.",
      values,
      fieldErrors(parsed.error)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return failure(
        "Email belum dikonfirmasi. Buka email Anda dan klik tautan konfirmasi.",
        values
      );
    }
    // Pesan sengaja sama untuk email tidak terdaftar dan password salah.
    return failure("Email atau password salah.", values);
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  // scope "local": hanya mengakhiri sesi di browser ini.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
