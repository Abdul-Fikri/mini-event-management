"use client";

import { useActionState } from "react";
import { saveMember } from "@/actions/members";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initial = { ok: false, message: "", errors: {}, values: {} };

export default function MemberForm({ member = null, returnTo = "/members" }) {
  const [state, formAction, pending] = useActionState(
    saveMember.bind(null, member?.id ?? null),
    initial,
  );
  const value = (key) => state.values?.[key] ?? member?.[key] ?? "";
  const linked = Boolean(member?.auth_user_id);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="return_to" value={returnTo} />
      {state.message ? <Alert>{state.message}</Alert> : null}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Data panitia</h3>
        <TextField id="full_name" name="full_name" label="Nama lengkap" required defaultValue={value("full_name")} error={state.errors?.full_name} />
        <TextField id="contact" name="contact" label="Kontak (opsional)" hint="Nomor telepon atau kontak lain." defaultValue={value("contact")} error={state.errors?.contact} />
      </div>
      <div className="space-y-4 border-t border-[#EEF2F6] pt-4">
        <h3 className="text-sm font-semibold text-slate-800">Akun login Panitia</h3>
        <TextField id="account_email" name="account_email" label="Email akun" type="email" required defaultValue={value("account_email")} error={state.errors?.account_email} hint="Email ini digunakan Panitia untuk login ke aplikasi." />
        <TextField id="account_password" name="account_password" label={linked ? "Password baru (opsional)" : "Password awal"} type="password" required={!linked} defaultValue="" error={state.errors?.account_password} hint={linked ? "Kosongkan jika tidak ingin mengganti password. Password lama tidak dapat ditampilkan." : "Minimal 8 karakter. Berikan password awal ini kepada Panitia secara aman."} autoComplete="new-password" />
        <TextField id="account_password_confirm" name="account_password_confirm" label={linked ? "Konfirmasi password baru" : "Konfirmasi password awal"} type="password" required={!linked} defaultValue="" error={state.errors?.account_password_confirm} hint={linked ? "Isi hanya jika kamu memasukkan password baru." : "Masukkan ulang password yang sama."} autoComplete="new-password" />
      </div>
      <div>
        <Button type="submit" pending={pending} pendingText="Menyimpan…">{linked ? "Simpan perubahan" : "Simpan & buat akun"}</Button>
        <p className="mt-2 text-xs text-slate-500">Untuk membatalkan, gunakan tombol × di pojok modal.</p>
      </div>
    </form>
  );
}
