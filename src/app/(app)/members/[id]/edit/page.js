import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MemberForm from "@/components/members/MemberForm";
export const metadata = { title: "Edit Anggota" };
export default async function EditMemberPage({ params }) {
  const { id } = await params; const { group } = await requireGroup(); const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("id,full_name,contact").eq("id", id).eq("group_id", group.id).maybeSingle();
  if (!member) notFound();
  return <div className="space-y-5"><div><Link href="/members" className="text-sm text-indigo-700">← Kembali ke anggota</Link><h1 className="mt-2 text-2xl font-semibold">Edit anggota</h1></div><div className="rounded-lg border border-zinc-200 bg-white p-5"><MemberForm member={member}/></div></div>;
}
