import { getEventContext } from "@/lib/events/get-event-context";
import FinanceSection from "@/components/events/FinanceSection";

export const metadata = { title: "Semua Transaksi Keuangan" };

export default async function AllTransactionsPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { group, event, supabase } = await getEventContext(id);
  const [
    { data: categories, error: categoryError },
    { data: transactions, error: transactionError },
    { data: members, error: memberError },
    { data: commitments, error: commitmentError },
  ] = await Promise.all([
    supabase.from("budget_categories").select("*").eq("event_id", id).eq("group_id", group.id).order("name"),
    supabase.from("transactions").select("*").eq("event_id", id).eq("group_id", group.id).order("trx_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("members").select("id,full_name").eq("group_id", group.id).order("full_name"),
    supabase.from("procurement_items").select("id,name,quantity,unit,est_unit_price,category_id").eq("event_id", id).eq("group_id", group.id).eq("status", "ordered").order("created_at"),
  ]);
  if (categoryError || transactionError || memberError || commitmentError) throw new Error("Gagal memuat riwayat transaksi event.");

  return <FinanceSection eventId={id} targetBudget={event.target_budget} categories={categories ?? []} transactions={transactions ?? []} members={members ?? []} commitments={commitments ?? []} financeError={query?.finance_error ?? ""} standaloneView="transactions" />;
}
