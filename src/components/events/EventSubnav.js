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
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-zinc-200 px-1"
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
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                : "border-transparent text-zinc-600 hover:border-indigo-300 hover:bg-zinc-50 hover:text-indigo-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
