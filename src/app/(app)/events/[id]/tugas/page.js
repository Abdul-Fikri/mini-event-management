import { getEventContext } from "@/lib/events/get-event-context";
import TaskSection from "@/components/events/TaskSection";
export const metadata = { title: "Tugas Event" };
export default async function EventTasksPage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);
  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase.from("tasks").select("*").eq("event_id", id).eq("group_id", group.id).order("due_date").order("created_at"),
    supabase.from("members").select("id,full_name").eq("group_id", group.id).order("full_name"),
  ]);
  return <TaskSection eventId={id} tasks={tasks ?? []} members={members ?? []}/>;
}
