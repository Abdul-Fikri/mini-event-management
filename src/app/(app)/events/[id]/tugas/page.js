import { getEventContext } from "@/lib/events/get-event-context";
import TaskSection from "@/components/events/TaskSection";
export const metadata = { title: "Tugas Event" };
export default async function EventTasksPage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);
  const [{ data: tasks }, { data: assignments }] = await Promise.all([
    supabase.from("tasks").select("*").eq("event_id", id).eq("group_id", group.id).order("due_date").order("created_at"),
    supabase.from("event_members").select("member_id").eq("event_id", id).eq("group_id", group.id),
  ]);
  const memberIds = [...new Set((assignments ?? []).map(item => item.member_id))];
  const { data: members } = memberIds.length
    ? await supabase.from("members").select("id,full_name").eq("group_id", group.id).in("id", memberIds).order("full_name")
    : { data: [] };
  return <TaskSection eventId={id} tasks={tasks ?? []} members={members ?? []}/>;
}
