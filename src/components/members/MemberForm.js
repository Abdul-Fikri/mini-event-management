"use client";

import Link from "next/link";
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
        <TextField id="account_password" name="account_password" label={linked ? "Password baru (opsional)" : "Password awal"} type="password" required={!linked} defaultValue="" error={state.errors?.account_password} hint={linked ? "Kosongkan jika tidak ingin mengganti password. Password lama tidak dapat ditampilkan." : "Minimal 8 karakter. Berikan password awal ini kepada Panitia secara aman."} autoComplete={linked ? "new-password" : "new-password"} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" pending={pending} pendingText="Menyimpan…">{linked ? "Simpan perubahan" : "Simpan & buat akun"}</Button>
        <Link href={returnTo} className="rounded-xl border border-[#D8E3ED] px-4 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC]">Batal</Link>
      </div>
    </form>
  );
}
