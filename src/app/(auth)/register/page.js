import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Daftar</h1>
      <p className="mb-5 text-sm text-zinc-600">
        Buat akun pemilik (Owner) untuk grup Anda.
      </p>
      <RegisterForm />
      <p className="mt-5 text-center text-sm text-zinc-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-indigo-700 hover:underline">
          Masuk
        </Link>
      </p>
    </>
  );
}
