import { getEventContext } from "@/lib/events/get-event-context";
import ProcurementSection from "@/components/events/ProcurementSection";
export const metadata = { title: "Pengadaan Event" };
export default async function EventProcurementPage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);
  const [{ data: items }, { data: assignments }] = await Promise.all([
    supabase.from("procurement_items").select("*").eq("event_id", id).eq("group_id", group.id).order("created_at"),
    supabase.from("event_members").select("member_id").eq("event_id", id).eq("group_id", group.id),
  ]);
  const memberIds = [...new Set((assignments ?? []).map(item => item.member_id))];
  const { data: members } = memberIds.length
    ? await supabase.from("members").select("id,full_name").eq("group_id", group.id).in("id", memberIds).order("full_name")
    : { data: [] };
  return <ProcurementSection eventId={id} items={items ?? []} members={members ?? []}/>;
}
