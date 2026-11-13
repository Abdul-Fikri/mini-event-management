"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  Settings2,
} from "lucide-react";
import { useAppUI } from "@/components/layout/AppUIContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Event", icon: CalendarDays },
  { href: "/members", label: "Anggota panitia", icon: UsersRound },
  { href: "/settings", label: "Pengaturan grup", icon: Settings2 },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { mobileNavOpen, closeMobileNav } = useAppUI();

  return (
    <nav
      id="primary-navigation"
      aria-label="Navigasi utama"
      className={`app-sidebar rounded-2xl border p-3 ${mobileNavOpen ? "block" : "hidden"} md:block`}
    >
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href} className="shrink-0 md:shrink">
              <Link
                prefetch={false}
                href={item.href}
                onClick={closeMobileNav}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-sm transition-colors md:w-full ${
                  active
                    ? "border border-[#DCE8F3] border-l-[#5C98CB] bg-[#EDF4FA] font-semibold text-[#284F73]"
                    : "border-transparent text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#334155]"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className={
                    active
                      ? "shrink-0 text-[#4F83B5]"
                      : "shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#5C8FBF]"
                  }
                />
                <span>{item.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-[#5C98CB] md:block"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
