import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MemberForm from "@/components/members/MemberForm";
import { getMemberReturnPath } from "@/lib/members-return-path";

export const metadata = { title: "Edit Anggota" };

export default async function EditMemberPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const returnTo = getMemberReturnPath(query?.returnTo);
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("id,full_name,contact")
    .eq("id", id)
    .eq("group_id", group.id)
    .maybeSingle();

  if (!member) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href={returnTo} className="management-link text-sm hover:underline">← Kembali ke anggota</Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit anggota</h1>
      </div>
      <div className="management-panel p-5 sm:p-6">
        <MemberForm member={member} returnTo={returnTo} />
      </div>
    </div>
  );
}
