"use client";

import { Menu, X } from "lucide-react";
import { useAppUI } from "@/components/layout/AppUIContext";

export default function NavMenuToggle() {
  const { mobileNavOpen, toggleMobileNav } = useAppUI();

  return (
    <button
      type="button"
      onClick={toggleMobileNav}
      aria-label={mobileNavOpen ? "Tutup navigasi" : "Buka navigasi"}
      aria-expanded={mobileNavOpen}
      aria-controls="primary-navigation"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE5EE] bg-white text-[#526579] transition-colors hover:bg-[#F7F9FC] md:hidden"
    >
      {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  );
}
