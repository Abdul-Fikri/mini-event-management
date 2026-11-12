import { getEventContext } from "@/lib/events/get-event-context";
import EventCommitteeList from "@/components/events/EventCommitteeList";

export const metadata = { title: "Semua Susunan Panitia" };

export default async function EventCommitteeAllPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { group, supabase } = await getEventContext(id);

  const [
    { data: assignments, error: assignmentError },
    { data: members, error: memberError },
    { data: divisions, error: divisionError },
  ] = await Promise.all([
    supabase
      .from("event_members")
      .select("id,member_id,division_id,division,position_title,responsibility")
      .eq("event_id", id)
      .eq("group_id", group.id)
      .order("created_at"),
    supabase
      .from("members")
      .select("id,full_name,contact")
      .eq("group_id", group.id)
      .order("full_name"),
    supabase
      .from("event_divisions")
      .select("id,name,description")
      .eq("event_id", id)
      .eq("group_id", group.id)
      .order("name"),
  ]);

  if (assignmentError || memberError || divisionError) {
    throw new Error("Gagal memuat seluruh susunan panitia event.");
  }

  const divisionById = new Map((divisions ?? []).map((division) => [division.id, division.name]));
  const memberById = new Map((members ?? []).map((member) => [member.id, member]));
  const committee = (assignments ?? []).map((item) => ({
    ...item,
    division: divisionById.get(item.division_id) ?? item.division,
    member: memberById.get(item.member_id),
  }));
  const requestedDivision = typeof query?.division === "string" ? query.division : "all";
  const initialDivisionFilter =
    requestedDivision === "all" ||
    requestedDivision === "unassigned" ||
    (divisions ?? []).some((division) => division.id === requestedDivision)
      ? requestedDivision
      : "all";

  return (
    <EventCommitteeList
      eventId={id}
      committee={committee}
      members={members ?? []}
      divisions={divisions ?? []}
      standalone
      initialSearch={typeof query?.q === "string" ? query.q : ""}
      initialDivisionFilter={initialDivisionFilter}
    />
  );
}
