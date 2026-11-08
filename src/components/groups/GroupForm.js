"use client";

import { useActionState } from "react";
import { createGroup } from "@/actions/groups";
import { initialFormState } from "@/lib/form-state";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const CATEGORY_SUGGESTIONS = [
  "Kelas",
  "Panitia / Organisasi",
  "Koperasi",
  "Komunitas",
  "Lainnya",
];

export default function GroupForm() {
  const [state, formAction, isPending] = useActionState(
    createGroup,
    initialFormState
  );

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <TextField
        id="name"
        name="name"
        label="Nama grup"
        required
        maxLength={120}
        placeholder="Contoh: Kelas 12 IPA 2"
        defaultValue={state.values?.name ?? ""}
        error={state.errors?.name}
      />
      <TextField
        id="category"
        name="category"
        label="Kategori (opsional)"
        maxLength={60}
        list="category-options"
        placeholder="Pilih atau ketik sendiri"
        defaultValue={state.values?.category ?? ""}
        error={state.errors?.category}
      />
      <datalist id="category-options">
        {CATEGORY_SUGGESTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <TextField
        id="description"
        name="description"
        label="Deskripsi (opsional)"
        multiline
        maxLength={1000}
        placeholder="Ceritakan singkat tentang grup Anda"
        defaultValue={state.values?.description ?? ""}
        error={state.errors?.description}
      />

      <Button type="submit" pending={isPending} pendingText="Menyimpan…" className="w-full">
        Buat grup
      </Button>
    </form>
  );
}
