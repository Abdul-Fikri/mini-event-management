"use client";

export default function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
  tone = "default",
}) {
  if (totalPages <= 1) return null;

  const polar = tone === "polar";
  const navClass = polar
    ? "flex flex-wrap items-center justify-center gap-3 border-t border-[#E2EBF5] pt-4"
    : "flex flex-wrap items-center justify-center gap-3 border-t border-zinc-100 pt-3";
  const buttonClass = polar
    ? "rounded-xl border border-[#D7E6F5] bg-white px-3.5 py-2 text-sm font-semibold text-[#334155] shadow-sm transition-colors hover:bg-[#F0F5FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-40"
    : "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40";
  const labelClass = polar
    ? "text-sm font-medium text-[#64748B]"
    : "text-sm text-zinc-600";

  return (
    <nav
      aria-label="Navigasi halaman daftar"
      className={navClass}
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className={buttonClass}
      >
        Sebelumnya
      </button>
      <span className={labelClass} aria-live="polite">
        Halaman {currentPage} dari {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className={buttonClass}
      >
        Selanjutnya
      </button>
    </nav>
  );
}
