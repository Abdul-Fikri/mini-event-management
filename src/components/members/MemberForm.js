"use client";
import { useActionState } from "react";
import { saveMember } from "@/actions/members";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
const initial = { ok: false, message: "", errors: {}, values: {} };
export default function MemberForm({ member = null }) {
  const [state, formAction, pending] = useActionState(
    saveMember.bind(null, member?.id ?? null),
    initial,
  );
  const value = (key) => state.values?.[key] ?? member?.[key] ?? "";
  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <TextField
        id="full_name"
        name="full_name"
        label="Nama lengkap"
        required
        defaultValue={value("full_name")}
        error={state.errors?.full_name}
      />
      <TextField
        id="contact"
        name="contact"
        label="Kontak (opsional)"
        hint="Nomor telepon atau email."
        defaultValue={value("contact")}
        error={state.errors?.contact}
      />
      <div className="flex gap-2">
        <Button type="submit" pending={pending} pendingText="Menyimpan…">
          Simpan anggota
        </Button>
        <a
          href="/members"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
        >
          Batal
        </a>
      </div>
    </form>
  );
}
