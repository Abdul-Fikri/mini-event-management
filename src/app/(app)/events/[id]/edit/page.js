import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EventForm from "@/components/events/EventForm";
export const metadata = { title: "Edit Event" };
export default async function EditEventPage({ params }) {
  const { id } = await params; const { group } = await requireGroup(); const supabase = await createClient();
  const [{ data: event }, { data: members }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).eq("group_id", group.id).maybeSingle(),
    supabase.from("members").select("id,full_name").eq("group_id", group.id).order("full_name"),
  ]);
  if (!event) notFound();
  return <div className="space-y-5"><div><Link href={`/events/${id}`} className="management-link text-sm hover:underline">← Kembali ke detail</Link><h1 className="mt-2 text-2xl font-semibold">Edit event</h1></div><div className="management-panel p-5 sm:p-6"><EventForm event={event} members={members ?? []}/></div></div>;
}
