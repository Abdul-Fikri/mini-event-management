"use client";

export default function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
  tone = "default",
}) {
  if (totalPages <= 1) return null;

  const labelTone = tone === "polar" ? "text-[#5B7894]" : "text-[#64748B]";
  const buttonClass =
    "rounded-xl border border-[#DCE5EE] bg-white px-3.5 py-2 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F7F9FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9AB7D0] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Navigasi halaman daftar"
      className="flex flex-wrap items-center justify-center gap-3 border-t border-[#EEF2F6] pt-4"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className={buttonClass}
      >
        Sebelumnya
      </button>
      <span className={`text-sm font-medium ${labelTone}`} aria-live="polite">
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
