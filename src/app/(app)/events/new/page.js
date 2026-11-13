import Link from "next/link";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EventForm from "@/components/events/EventForm";
export const metadata = { title: "Buat Event" };
export default async function NewEventPage() {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: members } = await supabase.from("members").select("id,full_name").eq("group_id", group.id).order("full_name");
  return <div className="space-y-5"><div><Link href="/events" className="management-link text-sm hover:underline">← Kembali ke event</Link><h1 className="mt-2 text-2xl font-semibold">Buat event</h1><p className="text-sm text-zinc-600">Isi informasi dasar acara.</p></div><div className="management-panel p-5 sm:p-6"><EventForm members={members ?? []}/></div></div>;
}
