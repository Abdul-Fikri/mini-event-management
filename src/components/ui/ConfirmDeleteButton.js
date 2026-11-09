"use client";

import { useEffect, useId } from "react";
import { useFormStatus } from "react-dom";
import { useAppLoading } from "@/components/layout/AppLoadingProvider";

export function ConfirmDeleteButton({
  children = "Hapus",
  message = "Yakin ingin menghapus data ini?",
}) {
  const { pending } = useFormStatus();
  const { setFormPending } = useAppLoading();
  const formId = useId();

  useEffect(() => {
    setFormPending(formId, pending);
    return () => setFormPending(formId, false);
  }, [formId, pending, setFormPending]);

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menghapus…" : children}
    </button>
  );
}
