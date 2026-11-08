-- Migration: link Panitia records to Supabase Auth and add event-scoped access.
-- Safe/additive: existing rows and Owner policies are preserved.
-- Apply manually in Supabase SQL Editor after reviewing this migration.
begin;
alter table public.members add column if not exists auth_user_id uuid
  references auth.users (id) on delete set null;
create unique index if not exists members_auth_user_id_uidx
  on public.members (auth_user_id) where auth_user_id is not null;
comment on column public.members.auth_user_id is
  'Optional Supabase Auth account linked to this Panitia member. NULL keeps legacy/non-login members unchanged.';
create or replace function public.is_event_member(p_event_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (select 1 from public.event_members em
    join public.members m on m.id = em.member_id and m.group_id = em.group_id
    where em.event_id = p_event_id and m.auth_user_id = (select auth.uid()));
$$;
revoke all on function public.is_event_member(uuid) from public, anon;
grant execute on function public.is_event_member(uuid) to authenticated;
drop policy if exists groups_panitia_read on public.groups;
create policy groups_panitia_read on public.groups for select to authenticated
using (exists (select 1 from public.members m
  where m.group_id = groups.id and m.auth_user_id = (select auth.uid())));
drop policy if exists members_panitia_read on public.members;
create policy members_panitia_read on public.members for select to authenticated
using (exists (select 1 from public.members self
  where self.group_id = members.group_id and self.auth_user_id = (select auth.uid())));
drop policy if exists events_panitia_read on public.events;
create policy events_panitia_read on public.events for select to authenticated
using (public.is_event_member(id));
drop policy if exists event_members_panitia_read on public.event_members;
create policy event_members_panitia_read on public.event_members for select to authenticated
using (public.is_event_member(event_id));
drop policy if exists schedule_items_panitia_manage on public.schedule_items;
create policy schedule_items_panitia_manage on public.schedule_items for all to authenticated
using (public.is_event_member(event_id)) with check (public.is_event_member(event_id));
drop policy if exists tasks_panitia_manage on public.tasks;
create policy tasks_panitia_manage on public.tasks for all to authenticated
using (public.is_event_member(event_id)) with check (public.is_event_member(event_id));
drop policy if exists procurement_items_panitia_manage on public.procurement_items;
create policy procurement_items_panitia_manage on public.procurement_items for all to authenticated
using (public.is_event_member(event_id)) with check (public.is_event_member(event_id));
drop policy if exists budget_categories_panitia_manage on public.budget_categories;
create policy budget_categories_panitia_manage on public.budget_categories for all to authenticated
using (public.is_event_member(event_id)) with check (public.is_event_member(event_id));
drop policy if exists transactions_panitia_manage on public.transactions;
create policy transactions_panitia_manage on public.transactions for all to authenticated
using (public.is_event_member(event_id)) with check (public.is_event_member(event_id));
commit;
