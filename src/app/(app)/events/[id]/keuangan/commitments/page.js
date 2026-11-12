import { getEventContext } from "@/lib/events/get-event-context";
import FinanceSection from "@/components/events/FinanceSection";

export const metadata = { title: "Semua Komitmen Pengadaan" };

export default async function AllCommitmentsPage({ params }) {
  const { id } = await params;
  const { group, supabase } = await getEventContext(id);
  const [
    { data: categories, error: categoryError },
    { data: commitments, error: commitmentError },
  ] = await Promise.all([
    supabase.from("budget_categories").select("id,name,planned_amount").eq("event_id", id).eq("group_id", group.id).order("name"),
    supabase.from("procurement_items").select("id,name,quantity,unit,est_unit_price,category_id").eq("event_id", id).eq("group_id", group.id).eq("status", "ordered").order("created_at"),
  ]);
  if (categoryError || commitmentError) throw new Error("Gagal memuat komitmen pengadaan event.");

  return <FinanceSection eventId={id} categories={categories ?? []} transactions={[]} members={[]} commitments={commitments ?? []} standaloneView="commitments" />;
}
