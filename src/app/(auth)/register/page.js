import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
export const metadata = { title: "Daftar" };
export default async function RegisterPage({ searchParams }) {
  const query = await searchParams;
  const next = typeof query?.next === "string" && query.next.startsWith("/join?token=") ? query.next : "";
  return <>
    <h1 className="mb-1 text-xl font-semibold">Daftar</h1>
    <p className="mb-5 text-sm text-zinc-600">{next ? "Buat akun menggunakan email yang menerima undangan Panitia." : "Buat akun pemilik (Owner) untuk grup Anda."}</p>
    <RegisterForm next={next}/>
    <p className="mt-5 text-center text-sm text-zinc-600">Sudah punya akun?{" "}
      <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-indigo-700 hover:underline">Masuk</Link>
    </p>
  </>;
}
