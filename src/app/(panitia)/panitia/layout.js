import Link from "next/link";
import { logout } from "@/actions/auth";
import { requirePanitia } from "@/lib/auth";
export default async function PanitiaLayout({ children }) {
  const { member, supabase } = await requirePanitia();
  const { data: group } = await supabase.from("groups").select("name").eq("id", member.group_id).maybeSingle();
  return <div className="min-h-screen bg-zinc-50 text-zinc-900">
    <header className="border-b border-zinc-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
      <div><p className="text-xs text-zinc-500">Mini Event Management · Panitia</p><Link href="/panitia" className="font-semibold">{group?.name || "Ruang Panitia"}</Link></div>
      <div className="flex items-center gap-3"><span className="hidden text-sm text-zinc-600 sm:inline">{member.full_name}</span><form action={logout}><button className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Keluar</button></form></div>
    </div></header>
    <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
  </div>;
}
