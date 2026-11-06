"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { initialFormState } from "@/lib/form-state";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialFormState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message ? (
        <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
      ) : null}

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
        autoComplete="current-password"
        required
        error={state.errors?.password}
      />

      <Button type="submit" pending={isPending} className="w-full">
        Masuk
      </Button>
    </form>
  );
}
