import { getEventContext } from "@/lib/events/get-event-context";
import EventExportSection from "@/components/events/EventExportSection";
export const metadata = { title: "Ekspor Data Event" };
export default async function EventExportPage({ params }) {
  const { id } = await params;
  await getEventContext(id);
  return <EventExportSection eventId={id}/>;
}
