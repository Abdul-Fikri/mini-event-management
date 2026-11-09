import { getEventContext } from "@/lib/events/get-event-context";
import ScheduleSection from "@/components/events/ScheduleSection";
export const metadata = { title: "Rundown Event" };
export default async function EventSchedulePage({ params }) {
  const { id } = await params;
  const { group, event, supabase } = await getEventContext(id);
  const [{ data: schedule }, { data: assignments }] = await Promise.all([
    supabase.from("schedule_items").select("*").eq("event_id", id).eq("group_id", group.id).order("item_date").order("start_time").order("sort_order"),
    supabase.from("event_members").select("member_id").eq("event_id", id).eq("group_id", group.id),
  ]);
  const memberIds = [...new Set((assignments ?? []).map(item => item.member_id))];
  const { data: members } = memberIds.length
    ? await supabase.from("members").select("id,full_name").eq("group_id", group.id).in("id", memberIds).order("full_name")
    : { data: [] };
  return <ScheduleSection eventId={id} eventStartDate={event.start_date} schedule={schedule ?? []} members={members ?? []}/>;
}
