import Link from "next/link";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteMember } from "@/actions/members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import MemberInvitationForm from "@/components/members/MemberInvitationForm";
export const metadata = { title: "Anggota Panitia" };
export default async function MembersPage() {
  const { group } = await requireGroup(); const supabase = await createClient();
  const { data: members, error } = await supabase.from("members").select("id,full_name,contact,created_at,auth_user_id").eq("group_id", group.id).order("full_name");
  if (error) throw new Error("Gagal memuat anggota.");
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Anggota panitia</h1><p className="text-sm text-zinc-600">Daftar orang yang dapat ditugaskan ke event.</p></div><Link href="/members/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">+ Tambah anggota</Link></div>
    {members.length ? <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">{members.map((m) => <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div><h2 className="font-medium">{m.full_name}</h2><p className="text-sm text-zinc-500">{m.contact || "Kontak belum diisi"}</p><MemberInvitationForm memberId={m.id} connected={Boolean(m.auth_user_id)}/></div>
      <div className="flex items-center gap-2"><Link href={`/members/${m.id}/edit`} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Edit</Link><form action={deleteMember}><input type="hidden" name="id" value={m.id}/><ConfirmDeleteButton message={`Hapus anggota ${m.full_name}? Penugasan dan kepanitiaan terkait akan dilepas.`}/></form></div>
    </div>)}</div> : <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center"><h2 className="font-semibold">Belum ada anggota</h2><p className="mt-1 text-sm text-zinc-600">Tambahkan anggota agar dapat dipilih sebagai koordinator event.</p><Link href="/members/new" className="mt-4 inline-block text-sm font-medium text-indigo-700">Tambah anggota pertama →</Link></div>}
  </div>;
}
