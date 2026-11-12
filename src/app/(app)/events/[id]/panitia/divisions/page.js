import { getEventContext } from "@/lib/events/get-event-context";
import EventDivisionManager from "@/components/events/EventDivisionManager";

export const metadata = { title: "Semua Divisi Event" };

export default async function EventDivisionsPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { group, supabase } = await getEventContext(id);
  const { data: divisions, error } = await supabase
    .from("event_divisions")
    .select("id,name,description")
    .eq("event_id", id)
    .eq("group_id", group.id)
    .order("name");

  if (error) throw new Error("Gagal memuat daftar divisi event.");

  return (
    <EventDivisionManager
      eventId={id}
      divisions={divisions ?? []}
      standalone
      initialSearch={typeof query?.q === "string" ? query.q : ""}
    />
  );
}
