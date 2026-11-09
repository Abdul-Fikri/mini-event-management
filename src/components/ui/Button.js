"use client";

import { useEffect, useId } from "react";
import { useFormStatus } from "react-dom";
import { useAppLoading } from "@/components/layout/AppLoadingProvider";

const VARIANTS = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 focus-visible:outline-indigo-600",
};

export function Button({
  variant = "primary",
  pending = false,
  pendingText = "Memproses…",
  className = "",
  children,
  ...rest
}) {
  const { pending: formPending } = useFormStatus();
  const { setFormPending } = useAppLoading();
  const formId = useId();
  const isPending = pending || formPending;

  useEffect(() => {
    setFormPending(formId, formPending);
    return () => setFormPending(formId, false);
  }, [formId, formPending, setFormPending]);

  return (
    <button
      {...rest}
      disabled={isPending || rest.disabled}
      aria-busy={isPending || undefined}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
