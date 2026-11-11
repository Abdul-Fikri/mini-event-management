-- =====================================================================
-- schema.sql (FINAL) — Mini Event Management, MVP model 1 role: Owner
-- Target  : Supabase PostgreSQL 15+ (memakai ON DELETE SET NULL (kolom))
-- Sifat   : hanya MEMBUAT objek baru. Tidak menghapus, menimpa, atau
--           mengosongkan apa pun. Berjalan sebagai SATU transaksi:
--           jika ada error, seluruhnya dibatalkan otomatis.
-- Pengaman: blok "pemeriksaan awal" di bawah menghentikan skrip jika
--           ada tabel/index/fungsi dengan nama yang sama di schema public.
-- Model   : hanya Owner yang login (auth.users). Anggota panitia = data.
-- Integritas: setiap tabel membawa group_id; Foreign Key komposit
--           memastikan semua referensi tetap di grup yang sama.
-- =====================================================================

begin;

-- 0. Pemeriksaan awal (berhenti sebelum membuat apa pun jika ada konflik)
do $$
declare
  konflik text;
begin
  if current_setting('server_version_num')::int < 150000 then
    raise exception 'Butuh PostgreSQL 15 ke atas (versi sekarang: %).',
      current_setting('server_version');
  end if;

  if to_regclass('auth.users') is null then
    raise exception 'auth.users tidak ditemukan: ini bukan database Supabase.';
  end if;

  select string_agg(c.relname, ', ' order by c.relname)
    into konflik
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = any (array[
       'groups','members','events','event_members','schedule_items','tasks',
       'procurement_items','budget_categories','transactions',
       'members_group_idx','events_group_idx','events_coordinator_idx',
       'event_members_member_idx','schedule_items_event_idx',
       'schedule_items_pic_idx','tasks_event_status_idx','tasks_assigned_idx',
       'procurement_event_idx','procurement_pic_idx','transactions_event_idx',
       'transactions_category_idx','transactions_recorded_by_idx'
     ]);

  if konflik is not null then
    raise exception
      'Konflik: objek berikut sudah ada di schema public: %. Tidak ada yang diubah.',
      konflik;
  end if;

  if exists (select 1
               from pg_proc p
               join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'set_updated_at') then
    raise exception
      'Konflik: fungsi public.set_updated_at sudah ada. Tidak ada yang diubah.';
  end if;
end $$;

-- 1. Fungsi util: updated_at otomatis ---------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- 2. Tabel -----------------------------------------------------------

-- 2.1 groups: 1 grup per Owner (UNIQUE owner_id)
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null unique references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (char_length(description) <= 1000),
  category    text check (char_length(category) <= 60),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.2 members: daftar orang panitia (tanpa akun login)
create table public.members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  full_name   text not null check (char_length(btrim(full_name)) between 1 and 120),
  contact     text check (char_length(contact) <= 120),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, group_id)                       -- target FK komposit
);

-- 2.3 events
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null references public.groups (id) on delete cascade,
  name           text not null check (char_length(btrim(name)) between 1 and 160),
  description    text check (char_length(description) <= 2000),
  category       text check (char_length(category) <= 60),
  start_date     date not null,
  end_date       date,
  planning_start_date date,
  preparation_start_date date,
  evaluation_end_date date,
  location       text check (char_length(location) <= 200),
  status_mode    text not null default 'automatic'
                 check (status_mode in ('automatic','manual')),
  status         text not null default 'draft'
                 check (status in ('draft','planned','planning','preparation','ongoing','evaluation','completed','cancelled')),
  coordinator_id uuid,
  target_budget  bigint check (target_budget >= 0 and target_budget <= 9007199254740991),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  constraint events_planning_dates_check check (
    (planning_start_date is null and preparation_start_date is null)
    or (
      planning_start_date is not null
      and preparation_start_date is not null
      and planning_start_date < preparation_start_date
      and preparation_start_date < start_date
    )
  ),
  constraint events_evaluation_end_date_check
    check (evaluation_end_date is null or evaluation_end_date > coalesce(end_date, start_date)),
  unique (id, group_id),                      -- target FK komposit
  foreign key (coordinator_id, group_id)
    references public.members (id, group_id)
    on delete set null (coordinator_id)
);

-- 2.4 event_members: susunan panitia per event
create table public.event_members (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null,
  event_id       uuid not null,
  member_id      uuid not null,
  division       text check (char_length(division) <= 80),
  position_title text check (char_length(position_title) <= 80),
  responsibility text check (char_length(responsibility) <= 500),
  created_at     timestamptz not null default now(),
  unique (event_id, member_id),
  foreign key (event_id, group_id)  references public.events  (id, group_id) on delete cascade,
  foreign key (member_id, group_id) references public.members (id, group_id) on delete cascade
);

-- 2.5 schedule_items: rundown
create table public.schedule_items (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null,
  event_id      uuid not null,
  title         text not null check (char_length(btrim(title)) between 1 and 160),
  item_date     date not null,
  start_time    time,
  end_time      time,
  location      text check (char_length(location) <= 200),
  pic_member_id uuid,
  notes         text check (char_length(notes) <= 1000),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (start_time is null or end_time is null or end_time >= start_time),
  foreign key (event_id, group_id) references public.events (id, group_id) on delete cascade,
  foreign key (pic_member_id, group_id)
    references public.members (id, group_id) on delete set null (pic_member_id)
);

-- 2.6 tasks
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null,
  event_id    uuid not null,
  title       text not null check (char_length(btrim(title)) between 1 and 160),
  description text check (char_length(description) <= 2000),
  assigned_to uuid,
  due_date    date,
  priority    text not null default 'medium' check (priority in ('low','medium','high')),
  status      text not null default 'todo'
              check (status in ('todo','in_progress','done','blocked')),
  notes       text check (char_length(notes) <= 1000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  foreign key (event_id, group_id) references public.events (id, group_id) on delete cascade,
  foreign key (assigned_to, group_id)
    references public.members (id, group_id) on delete set null (assigned_to)
);

-- 2.7 procurement_items: kebutuhan barang/perlengkapan event
create table public.procurement_items (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null,
  event_id          uuid not null,
  name              text not null check (char_length(btrim(name)) between 1 and 160),
  specification     text check (char_length(specification) <= 500),
  quantity          numeric(12,2) not null default 1 check (quantity > 0),
  unit              text check (char_length(unit) <= 30),
  est_unit_price    bigint check (est_unit_price >= 0 and est_unit_price <= 9007199254740991),
  actual_unit_price bigint check (actual_unit_price >= 0 and actual_unit_price <= 9007199254740991),
  pic_member_id     uuid,
  status            text not null default 'not_started'
                    check (status in ('not_started','requested','purchased','ready','not_needed')),
  supplier          text check (char_length(supplier) <= 120),
  notes             text check (char_length(notes) <= 1000),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  foreign key (event_id, group_id) references public.events (id, group_id) on delete cascade,
  foreign key (pic_member_id, group_id)
    references public.members (id, group_id) on delete set null (pic_member_id)
);

-- 2.8 budget_categories
create table public.budget_categories (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null,
  event_id       uuid not null,
  name           text not null check (char_length(btrim(name)) between 1 and 80),
  planned_amount bigint not null default 0
                 check (planned_amount >= 0 and planned_amount <= 9007199254740991),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (event_id, name),
  unique (id, event_id),                      -- target FK komposit dari transactions
  foreign key (event_id, group_id) references public.events (id, group_id) on delete cascade
);

-- 2.9 transactions: pemasukan (income) & pengeluaran (expense)
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null,
  event_id    uuid not null,
  category_id uuid,
  type        text not null check (type in ('income','expense')),
  trx_date    date not null default current_date,
  description text not null check (char_length(btrim(description)) between 1 and 200),
  amount      bigint not null check (amount > 0 and amount <= 9007199254740991),
  recorded_by uuid,
  reference   text check (char_length(reference) <= 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  foreign key (event_id, group_id) references public.events (id, group_id) on delete cascade,
  -- NO ACTION (bukan RESTRICT): kategori yang dipakai transaksi tidak bisa
  -- dihapus sendiri, tetapi penghapusan event tetap boleh menghapus keduanya.
  foreign key (category_id, event_id)
    references public.budget_categories (id, event_id),
  foreign key (recorded_by, group_id)
    references public.members (id, group_id) on delete set null (recorded_by)
);

-- 3. Index ---------------------------------------------------------------
create index members_group_idx           on public.members (group_id);
create index events_group_idx            on public.events (group_id, start_date);
create index events_coordinator_idx      on public.events (coordinator_id) where coordinator_id is not null;
create index event_members_member_idx    on public.event_members (member_id);
create index schedule_items_event_idx    on public.schedule_items (event_id, item_date, start_time, sort_order);
create index schedule_items_pic_idx      on public.schedule_items (pic_member_id) where pic_member_id is not null;
create index tasks_event_status_idx      on public.tasks (event_id, status);
create index tasks_assigned_idx          on public.tasks (assigned_to) where assigned_to is not null;
create index procurement_event_idx       on public.procurement_items (event_id, status);
create index procurement_pic_idx         on public.procurement_items (pic_member_id) where pic_member_id is not null;
create index transactions_event_idx      on public.transactions (event_id, trx_date);
create index transactions_category_idx   on public.transactions (category_id) where category_id is not null;
create index transactions_recorded_by_idx on public.transactions (recorded_by) where recorded_by is not null;

-- 4. Trigger updated_at -----------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['groups','members','events','schedule_items','tasks',
                           'procurement_items','budget_categories','transactions']
  loop
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);
  end loop;
end $$;

-- 5. Hak akses (least privilege) -------------------------------------
-- Cabut semua hak bawaan dari anon dan authenticated (default Supabase bisa
-- memberi hak berlebih yang tidak tunduk pada RLS), lalu beri authenticated
-- hanya empat operasi dasar. anon tidak mendapat hak apa pun.
revoke all on public.groups, public.members, public.events, public.event_members,
              public.schedule_items, public.tasks, public.procurement_items,
              public.budget_categories, public.transactions
  from anon, authenticated;

grant select, insert, update, delete
  on public.groups, public.members, public.events, public.event_members,
     public.schedule_items, public.tasks, public.procurement_items,
     public.budget_categories, public.transactions
  to authenticated;

-- 6. Row Level Security ----------------------------------------------
-- Tanpa fungsi SECURITY DEFINER dan tanpa rekursi: tabel anak cukup
-- memeriksa baris groups miliknya (groups hanya melihat kolomnya sendiri).
alter table public.groups enable row level security;

create policy groups_owner_all on public.groups
  for all to authenticated
  using      (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['members','events','event_members','schedule_items',
                           'tasks','procurement_items','budget_categories','transactions']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (exists (select 1 from public.groups g
                        where g.id = %I.group_id and g.owner_id = (select auth.uid())))
         with check (exists (select 1 from public.groups g
                             where g.id = %I.group_id and g.owner_id = (select auth.uid())))',
      t || '_owner_all', t, t, t);
  end loop;
end $$;

commit;