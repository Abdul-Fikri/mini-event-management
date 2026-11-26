"use client";

import { useFormStatus } from "react-dom";
import { Lottie } from "lottie-react";

export default function ProcurementFinanceSyncButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#407BB0] px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#32628E] disabled:cursor-wait disabled:opacity-85"
    >
      {pending ? (
        <>
          <span className="h-7 w-7 shrink-0" aria-hidden="true">
            <Lottie
              src="/animations/loading.json"
              autoplay
              loop
              className="h-full w-full"
            />
          </span>
          <span role="status" aria-live="polite">Mencatat ke Keuangan...</span>
        </>
      ) : (
        "Catat ke Keuangan"
      )}
    </button>
  );
}
