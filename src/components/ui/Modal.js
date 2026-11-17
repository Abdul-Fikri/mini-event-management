"use client";

import { useEffect, useId, useRef } from "react";

export default function Modal({ open, onClose, title, description, children, size = "lg" }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const focusable = dialogRef.current?.querySelectorAll(focusableSelector) ?? [];
    focusable[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab" && focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  const width = size === "md" ? "max-w-xl" : "max-w-2xl";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`flex max-h-[92dvh] w-full ${width} flex-col overflow-hidden rounded-t-2xl border border-[#E3ECF5] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:rounded-2xl`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#EAF0F6] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold tracking-tight text-[#1E293B]">{title}</h2>
            {description ? <p id={descriptionId} className="mt-1 text-sm leading-6 text-[#64748B]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E3ECF5] text-xl leading-none text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#407BB0]"
          >
            ×
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </section>
    </div>
  );
}
