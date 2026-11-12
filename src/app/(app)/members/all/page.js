import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MemberList from "@/components/members/MemberList";

export const metadata = { title: "Semua Anggota Panitia" };

export default async function AllMembersPage() {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("id,full_name,contact,created_at,auth_user_id")
    .eq("group_id", group.id)
    .order("full_name");

  if (error) throw new Error("Gagal memuat seluruh anggota.");
  return <MemberList members={members ?? []} standalone />;
}
