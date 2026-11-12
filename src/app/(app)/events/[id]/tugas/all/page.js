import { getEventContext } from "@/lib/events/get-event-context";
import TaskSection from "@/components/events/TaskSection";

export const metadata = { title: "Semua Tugas Event" };

export default async function AllTasksPage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);
  const [{ data: tasks, error: taskError }, { data: assignments, error: assignmentError }] = await Promise.all([
    supabase.from("tasks").select("*").eq("event_id", id).eq("group_id", group.id).order("due_date").order("created_at"),
    supabase.from("event_members").select("member_id").eq("event_id", id).eq("group_id", group.id),
  ]);
  if (taskError || assignmentError) throw new Error("Gagal memuat seluruh tugas event.");

  const memberIds = [...new Set((assignments ?? []).map((item) => item.member_id))];
  const { data: members, error: memberError } = memberIds.length
    ? await supabase.from("members").select("id,full_name").eq("group_id", group.id).in("id", memberIds).order("full_name")
    : { data: [], error: null };
  if (memberError) throw new Error("Gagal memuat daftar penanggung jawab tugas.");

  return <TaskSection eventId={id} tasks={tasks ?? []} members={members ?? []} standalone />;
}
