import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClaimInvitationForm from "@/components/auth/ClaimInvitationForm";
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

  return (
    <div className="mx-auto max-w-lg space-y-5 rounded-xl border border-[#E3ECF5] bg-white p-6">
      <div>
        <p className="text-sm font-semibold text-[#407BB0]">Mini Event Management</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1E293B]">Undangan Panitia</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Owner mengundang kamu untuk bergabung sebagai anggota panitia. Ikuti langkah di bawah untuk menghubungkan akun.
        </p>
      </div>

      {query?.error ? (
        <Alert tone="error">
          Undangan belum berhasil diterima. Pastikan email akun sama dengan email tujuan undangan dan tautan masih berlaku.
        </Alert>
      ) : null}

      {!valid ? (
        <Alert tone="error">Tautan undangan tidak ditemukan atau formatnya tidak valid. Minta Owner mengirim tautan baru.</Alert>
      ) : loggedIn ? (
        <ClaimInvitationForm token={token} />
      ) : (
        <div className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-[#475569]">
            <li>Buat akun menggunakan email yang menerima undangan.</li>
            <li>Jika diminta, konfirmasi email melalui pesan dari Supabase.</li>
            <li>Masuk menggunakan email tersebut, lalu buka kembali tautan undangan ini dan tekan Terima undangan.</li>
          </ol>
          <div className="space-y-2 border-t border-[#EEF2F6] pt-4">
            <Link
              className="block rounded-xl bg-[#407BB0] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#32628E]"
              href={"/register?next=" + encodeURIComponent(next)}
            >
              Buat akun
            </Link>
            <Link
              className="block rounded-xl border border-[#D8E3ED] px-4 py-2.5 text-center text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
              href={"/login?next=" + encodeURIComponent(next)}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
          <p className="text-xs leading-5 text-[#64748B]">
            Undangan hanya bisa digunakan sekali, ditujukan ke satu email, dan berlaku 48 jam.
          </p>
        </div>
      )}
    </div>
  );
}
