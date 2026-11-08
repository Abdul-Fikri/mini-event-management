import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { claimMemberInvitation } from "@/actions/invitations";
import { Alert } from "@/components/ui/Alert";
export const metadata = { title: "Terima Undangan Panitia" };
export default async function JoinPage({ searchParams }) {
  const query = await searchParams;
  const token = typeof query?.token === "string" ? query.token : "";
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);
  const next = token ? "/join?token=" + encodeURIComponent(token) : "/join";
  const valid = /^[a-f0-9]{64}$/i.test(token);
  return <div className="mx-auto max-w-lg space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
    <div><p className="text-sm text-indigo-700">Mini Event Management</p><h1 className="mt-1 text-2xl font-semibold">Undangan Panitia</h1><p className="mt-2 text-sm text-zinc-600">Terima undangan untuk bergabung sebagai anggota panitia pada event yang ditugaskan.</p></div>
    {query?.error ? <Alert tone="error">Undangan tidak dapat diklaim. Pastikan email akun sesuai dengan email undangan dan tautan belum kedaluwarsa atau digunakan.</Alert> : null}
    {!valid ? <Alert tone="error">Token undangan tidak ditemukan atau formatnya tidak valid.</Alert> : loggedIn ? <form action={claimMemberInvitation} className="space-y-3">
      <input type="hidden" name="token" value={token}/>
      <p className="text-sm text-zinc-700">Akun sudah masuk. Email akun harus sama dengan email tujuan undangan.</p>
      <button className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Terima undangan</button>
    </form> : <div className="space-y-3">
      <p className="text-sm text-zinc-700">Masuk atau buat akun menggunakan email yang menerima undangan. Setelah autentikasi, buka kembali tautan ini.</p>
      <Link className="block rounded-md bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white" href={"/register?next=" + encodeURIComponent(next)}>Buat akun</Link>
      <Link className="block rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-semibold" href={"/login?next=" + encodeURIComponent(next)}>Sudah punya akun? Masuk</Link>
    </div>}
  </div>;
}
