import { getEventContext } from "@/lib/events/get-event-context";
import ProcurementSection from "@/components/events/ProcurementSection";
export const metadata = { title: "Pengadaan Event" };
export default async function EventProcurementPage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);
  const [{ data: items }, { data: members }] = await Promise.all([
    supabase.from("procurement_items").select("*").eq("event_id", id).eq("group_id", group.id).order("created_at"),
    supabase.from("members").select("id,full_name").eq("group_id", group.id).order("full_name"),
  ]);
  return <ProcurementSection eventId={id} items={items ?? []} members={members ?? []}/>;
}
