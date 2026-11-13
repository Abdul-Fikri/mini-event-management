"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "", label: "Overview" },
  { href: "/panitia", label: "Panitia" },
  { href: "/rundown", label: "Rundown" },
  { href: "/tugas", label: "Tugas" },
  { href: "/pengadaan", label: "Pengadaan" },
  { href: "/keuangan", label: "Keuangan" },
  { href: "/ekspor", label: "Ekspor" },
];

export default function EventSubnav({ eventId }) {
  const pathname = usePathname();
  const basePath = `/events/${eventId}`;

  return (
    <nav
      aria-label="Navigasi event"
      className="flex items-center gap-1 overflow-x-auto"
    >
      {SECTIONS.map((item) => {
        const href = `${basePath}${item.href}`;
        const active =
          item.href === ""
            ? pathname === basePath || pathname === `${basePath}/`
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={item.href || "overview"}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
              active
                ? "bg-[#EDF4FA] text-[#284F73]"
                : "text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#334155]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
