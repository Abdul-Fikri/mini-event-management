"use client";

import { useEffect, useId } from "react";
import { useFormStatus } from "react-dom";
import { useAppLoading } from "@/components/layout/AppLoadingProvider";

const VARIANTS = {
  primary:
    "bg-[#407BB0] text-white hover:bg-[#32628E] focus-visible:outline-[#407BB0]",
  secondary:
    "border border-[#DCE5EE] bg-white text-[#475569] hover:bg-[#F7F9FC] focus-visible:outline-[#9AB7D0]",
  ice:
    "bg-[#407BB0] text-white hover:bg-[#32628E] focus-visible:outline-[#407BB0]",
  iceSecondary:
    "border border-[#DCE5EE] bg-white text-[#456B8E] hover:bg-[#F5F8FC] focus-visible:outline-[#9AB7D0]",
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
    setFormPending(formId, isPending);
    return () => setFormPending(formId, false);
  }, [formId, isPending, setFormPending]);

  return (
    <button
      {...rest}
      disabled={isPending || rest.disabled}
      aria-busy={isPending || undefined}
      className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
