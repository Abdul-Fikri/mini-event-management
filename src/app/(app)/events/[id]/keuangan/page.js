import { getEventContext } from "@/lib/events/get-event-context";
import FinanceSection from "@/components/events/FinanceSection";
export const metadata = { title: "Keuangan Event" };
export default async function EventFinancePage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { group, event, supabase } = await getEventContext(id);
  const [{ data: categories }, { data: transactions }, { data: members }] = await Promise.all([
    supabase.from("budget_categories").select("*").eq("event_id", id).eq("group_id", group.id).order("name"),
    supabase.from("transactions").select("*").eq("event_id", id).eq("group_id", group.id).order("trx_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("members").select("id,full_name").eq("group_id", group.id).order("full_name"),
  ]);
  return <FinanceSection eventId={id} targetBudget={event.target_budget} categories={categories ?? []} transactions={transactions ?? []} members={members ?? []} financeError={query?.finance_error ?? ""}/>;
}
