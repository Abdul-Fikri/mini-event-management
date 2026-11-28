"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { claimMemberInvitation } from "@/actions/invitations";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "", errors: {} };

export default function ClaimInvitationForm({ token }) {
  const [state, formAction, pending] = useActionState(claimMemberInvitation, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.replace("/panitia");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm leading-6 text-slate-700">
        Pastikan kamu sudah masuk menggunakan email yang menerima undangan. Setelah menekan tombol, aplikasi akan memeriksa email dan masa berlaku tautan.
      </p>
      {state.message ? (
        <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
      ) : null}
      <Button type="submit" pending={pending} pendingText="Memeriksa undangan…" className="w-full">
        Terima undangan
      </Button>
      {state.ok ? (
        <Link href="/panitia" className="block text-center text-sm font-semibold text-[#407BB0] hover:underline">
          Jika halaman belum terbuka, klik untuk masuk ke halaman panitia
        </Link>
      ) : null}
    </form>
  );
}
