-- Event-scoped division master data for the Owner's committee workflow.
-- Existing event_members.division text values are migrated into event_divisions.
-- The text column remains as a synchronized snapshot for Panitia views and CSV compatibility.

begin;

create table if not exists public.event_divisions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null,
  event_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (char_length(description) <= 250),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_divisions_id_event_group_key unique (id, event_id, group_id),
  constraint event_divisions_event_group_fkey
    foreign key (event_id, group_id)
    references public.events (id, group_id)
    on delete cascade
);

alter table public.event_members
  add column if not exists division_id uuid;

do $$
declare
  division_id_type text;
begin
  select udt_name
    into division_id_type
    from information_schema.columns
   where table_schema = 'public'
     and table_name = 'event_members'
     and column_name = 'division_id';

  if division_id_type is distinct from 'uuid' then
    raise exception 'public.event_members.division_id must be uuid (found: %).',
      division_id_type;
  end if;
end;
$$;

create unique index if not exists event_divisions_event_name_uidx
  on public.event_divisions (event_id, lower(btrim(name)));

create index if not exists event_divisions_group_event_idx
  on public.event_divisions (group_id, event_id);

create index if not exists event_members_division_id_idx
  on public.event_members (division_id)
  where division_id is not null;

insert into public.event_divisions (group_id, event_id, name)
select
  em.group_id,
  em.event_id,
  min(btrim(em.division))
from public.event_members em
where nullif(btrim(em.division), '') is not null
group by em.group_id, em.event_id, lower(btrim(em.division))
on conflict do nothing;

update public.event_members em
   set division_id = d.id,
       division = d.name
  from public.event_divisions d
 where em.division_id is null
   and em.group_id = d.group_id
   and em.event_id = d.event_id
   and nullif(btrim(em.division), '') is not null
   and lower(btrim(em.division)) = lower(btrim(d.name));

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.event_divisions'::regclass
       and conname = 'event_divisions_id_event_group_key'
  ) then
    alter table public.event_divisions
      add constraint event_divisions_id_event_group_key
      unique (id, event_id, group_id);
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.event_divisions'::regclass
       and conname = 'event_divisions_event_group_fkey'
  ) then
    alter table public.event_divisions
      add constraint event_divisions_event_group_fkey
      foreign key (event_id, group_id)
      references public.events (id, group_id)
      on delete cascade;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.event_members'::regclass
       and conname = 'event_members_division_id_event_group_fkey'
  ) then
    alter table public.event_members
      add constraint event_members_division_id_event_group_fkey
      foreign key (division_id, event_id, group_id)
      references public.event_divisions (id, event_id, group_id)
      on delete set null (division_id);
  end if;
end;
$$;

create or replace function public.sync_event_member_division_label()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.name is distinct from old.name then
    update public.event_members
       set division = new.name
     where division_id = new.id
       and event_id = new.event_id
       and group_id = new.group_id;
  end if;

  return new;
end;
$$;

drop trigger if exists event_divisions_set_updated_at on public.event_divisions;
create trigger event_divisions_set_updated_at
  before update on public.event_divisions
  for each row
  execute function public.set_updated_at();

drop trigger if exists event_divisions_sync_member_label on public.event_divisions;
create trigger event_divisions_sync_member_label
  after update of name on public.event_divisions
  for each row
  execute function public.sync_event_member_division_label();

alter table public.event_divisions enable row level security;

revoke all on public.event_divisions from anon, authenticated;
grant select, insert, update, delete on public.event_divisions to authenticated;

drop policy if exists event_divisions_owner_all on public.event_divisions;
create policy event_divisions_owner_all on public.event_divisions
  for all to authenticated
  using (
    exists (
      select 1 from public.groups g
       where g.id = event_divisions.group_id
         and g.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.groups g
       where g.id = event_divisions.group_id
         and g.owner_id = (select auth.uid())
    )
  );

drop policy if exists event_divisions_panitia_read on public.event_divisions;
create policy event_divisions_panitia_read on public.event_divisions
  for select to authenticated
  using (public.is_event_member(event_id));

revoke all on function public.sync_event_member_division_label() from public, anon;
grant execute on function public.sync_event_member_division_label() to authenticated;

comment on table public.event_divisions is
  'Owner-managed division master list scoped to one event. Existing event_members.division text is retained as a display/export snapshot.';
comment on column public.event_members.division_id is
  'Optional event-specific division reference. The legacy division text is synchronized as a display/export snapshot.';

commit;
