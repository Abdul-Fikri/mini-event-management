"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/actions/auth";
import { initialFormState } from "@/lib/form-state";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    register,
    initialFormState
  );

  // Konfirmasi email aktif: tampilkan petunjuk, bukan form lagi.
  if (state.ok) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{state.message}</Alert>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-indigo-700 hover:underline"
        >
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email ?? ""}
        error={state.errors?.email}
      />
      <TextField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="Minimal 8 karakter."
        error={state.errors?.password}
      />
      <TextField
        id="confirmPassword"
        name="confirmPassword"
        label="Ulangi password"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors?.confirmPassword}
      />

      <Button type="submit" pending={isPending} className="w-full">
        Daftar
      </Button>
    </form>
  );
}
