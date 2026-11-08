"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const NAV_ITEMS = [{ href: "/dashboard", label: "Dashboard" },{ href: "/events", label: "Event" },{ href: "/members", label: "Anggota panitia" }];
export default function NavLinks() {
  const pathname = usePathname();
  return <nav aria-label="Navigasi utama"><ul className="flex gap-1 overflow-x-auto md:flex-col">{NAV_ITEMS.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={`block whitespace-nowrap rounded-md border-l-4 px-3 py-2 text-sm ${active ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-900" : "border-transparent text-zinc-700 hover:bg-zinc-100"}`}>{item.label}</Link></li>;
  })}</ul></nav>;
}
