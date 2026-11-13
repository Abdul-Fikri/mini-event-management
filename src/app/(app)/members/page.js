import Link from "next/link";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MemberList from "@/components/members/MemberList";

export const metadata = { title: "Anggota Panitia" };

export default async function MembersPage() {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("id,full_name,contact,created_at,auth_user_id")
    .eq("group_id", group.id)
    .order("full_name");

  if (error) throw new Error("Gagal memuat anggota.");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Anggota panitia</h1><p className="text-sm text-zinc-600">Daftar orang yang dapat ditugaskan ke event.</p></div>
        <Link href="/members/new" className="rounded-xl bg-[#407BB0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#32628E]">+ Tambah anggota</Link>
      </div>
      <MemberList members={members ?? []} />
    </div>
  );
}
