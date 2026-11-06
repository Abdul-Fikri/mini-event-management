import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Masuk</h1>
      <p className="mb-5 text-sm text-zinc-600">
        Masuk untuk mengelola acara grup Anda.
      </p>
      <LoginForm />
      <p className="mt-5 text-center text-sm text-zinc-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-indigo-700 hover:underline">
          Daftar
        </Link>
      </p>
    </>
  );
}
