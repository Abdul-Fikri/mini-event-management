"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu yang belum dibangun ditampilkan nonaktif ("Segera"), bukan tautan mati.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", ready: true },
  { href: "/events", label: "Event", ready: false },
  { href: "/members", label: "Anggota panitia", ready: false },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV_ITEMS.map((item) => {
          if (!item.ready) {
            return (
              <li key={item.href}>
                <span
                  aria-disabled="true"
                  className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-zinc-400"
                >
                  {item.label}
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-500">
                    Segera
                  </span>
                </span>
              </li>
            );
          }

          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-md border-l-4 px-3 py-2 text-sm ${
                  active
                    ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-900"
                    : "border-transparent text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
