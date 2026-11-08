import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
export const metadata = { title: "Masuk" };
export default async function LoginPage({ searchParams }) {
  const query = await searchParams;
  const next = typeof query?.next === "string" && query.next.startsWith("/join?token=") ? query.next : "";
  return <>
    <h1 className="mb-1 text-xl font-semibold">Masuk</h1>
    <p className="mb-5 text-sm text-zinc-600">{next ? "Masuk dengan email yang menerima undangan Panitia." : "Masuk untuk mengelola acara grup Anda."}</p>
    <LoginForm next={next}/>
    <p className="mt-5 text-center text-sm text-zinc-600">Belum punya akun?{" "}
      <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-medium text-indigo-700 hover:underline">Daftar</Link>
    </p>
  </>;
}
