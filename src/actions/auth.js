"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { fieldErrors, readForm } from "@/lib/validators/helpers";
function failure(message, values = {}, errors = {}) { return { ok: false, message, errors, values }; }
function safeNext(value) { return typeof value === "string" && value.startsWith("/join?token=") ? value : null; }
const SIGN_UP_ERRORS = {
  user_already_exists: "Email ini sudah terdaftar. Silakan masuk.",
  email_exists: "Email ini sudah terdaftar. Silakan masuk.",
  weak_password: "Password terlalu lemah. Gunakan kombinasi yang lebih kuat.",
  email_address_invalid: "Alamat email tidak dapat digunakan.",
  over_email_send_rate_limit: "Terlalu banyak permintaan email. Tunggu beberapa saat lalu coba lagi.",
  signup_disabled: "Pendaftaran sedang dinonaktifkan.",
};
export async function register(prevState, formData) {
  const raw = readForm(formData, ["email", "password", "confirmPassword", "next"]);
  const values = { email: raw.email };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return failure("Periksa kembali isian Anda.", values, fieldErrors(parsed.error));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    console.error("[register]", error.message, error.code);
    return failure(SIGN_UP_ERRORS[error.code] ?? "Pendaftaran gagal. Periksa email dan password, lalu coba lagi.", values);
  }
  if (data.session) redirect(safeNext(raw.next) ?? "/onboarding");
  return { ok: true, message: "Pendaftaran berhasil. Periksa email untuk konfirmasi, lalu buka kembali tautan undangan.", errors: {}, values: {} };
}
export async function login(prevState, formData) {
  const raw = readForm(formData, ["email", "password", "next"]);
  const values = { email: raw.email };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return failure("Periksa kembali isian Anda.", values, fieldErrors(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") return failure("Email belum dikonfirmasi. Buka email Anda dan klik tautan konfirmasi.", values);
    return failure("Email atau password salah.", values);
  }
  if (safeNext(raw.next)) redirect(safeNext(raw.next));
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const { data: panitia } = await supabase.from("members").select("id").eq("auth_user_id", userData.user.id).maybeSingle();
    if (panitia) redirect("/panitia");
  }
  redirect("/dashboard");
}
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
