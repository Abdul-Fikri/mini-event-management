-- Integrate procurement commitments with the event finance ledger.
-- Ordered items contribute to commitments; purchased items create one linked expense.
begin;

alter table public.procurement_items
  add column category_id uuid,
  add column purchased_date date;

alter table public.procurement_items
  drop constraint if exists procurement_items_status_check;

alter table public.procurement_items
  add constraint procurement_items_status_check
    check (status in ('not_started', 'requested', 'ordered', 'purchased', 'ready', 'not_needed')),
  add constraint procurement_items_category_id_event_id_fkey
    foreign key (category_id, event_id)
    references public.budget_categories (id, event_id)
    on delete set null (category_id),
  add constraint procurement_items_id_event_group_key
    unique (id, event_id, group_id);

alter table public.transactions
  add column procurement_item_id uuid,
  add constraint transactions_procurement_item_id_key
    unique (procurement_item_id),
  add constraint transactions_procurement_item_expense_check
    check (procurement_item_id is null or type = 'expense'),
  add constraint transactions_procurement_item_id_event_id_group_id_fkey
    foreign key (procurement_item_id, event_id, group_id)
    references public.procurement_items (id, event_id, group_id)
    on delete set null (procurement_item_id);

create index procurement_category_idx
  on public.procurement_items (category_id)
  where category_id is not null;

-- If an item is marked as purchased/ready without a date, use today's Jakarta date.
create function public.prepare_procurement_purchase_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('purchased', 'ready') and new.purchased_date is null then
    if tg_op = 'INSERT' then
      new.purchased_date := (now() at time zone 'Asia/Jakarta')::date;
    elsif old.status not in ('purchased', 'ready') then
      new.purchased_date := (now() at time zone 'Asia/Jakarta')::date;
    end if;
  end if;

  return new;
end;
$$;

-- Shared upsert routine. It is SECURITY INVOKER so table grants and Owner RLS
-- remain in force for both the trigger and the explicit legacy-sync action.
create function public.upsert_procurement_expense_for_item(
  p_item_id uuid,
  p_event_id uuid,
  p_group_id uuid
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  item public.procurement_items%rowtype;
  expense_amount bigint;
  expense_reference text;
  transaction_id uuid;
begin
  select *
    into item
    from public.procurement_items p
   where p.id = p_item_id
     and p.event_id = p_event_id
     and p.group_id = p_group_id
   for update;

  if not found then
    raise exception 'Item pengadaan tidak ditemukan pada event/grup ini.'
      using errcode = 'P0002';
  end if;

  if item.status not in ('purchased', 'ready') then
    raise exception 'Hanya item Sudah dibeli/Siap digunakan yang dapat dicatat sebagai pengeluaran.'
      using errcode = '23514';
  end if;

  if item.actual_unit_price is null or item.actual_unit_price <= 0 then
    raise exception 'Harga aktual wajib lebih dari Rp0 sebelum pembelian dicatat ke Keuangan.'
      using errcode = '23514';
  end if;

  if round(item.actual_unit_price * item.quantity) <= 0
     or round(item.actual_unit_price * item.quantity) > 9007199254740991 then
    raise exception 'Total pembelian tidak valid atau melebihi batas nominal yang didukung.'
      using errcode = '23514';
  end if;
  expense_amount := round(item.actual_unit_price * item.quantity)::bigint;

  expense_reference := left(
    'Pengadaan otomatis' ||
    case when item.supplier is not null then ' · ' || item.supplier else '' end,
    200
  );

  insert into public.transactions (
    group_id,
    event_id,
    category_id,
    type,
    trx_date,
    description,
    amount,
    reference,
    procurement_item_id
  )
  values (
    item.group_id,
    item.event_id,
    item.category_id,
    'expense',
    coalesce(item.purchased_date, (now() at time zone 'Asia/Jakarta')::date),
    left('Pembelian: ' || item.name, 200),
    expense_amount,
    expense_reference,
    item.id
  )
  on conflict (procurement_item_id)
  do update set
    type = 'expense',
    category_id = excluded.category_id,
    trx_date = excluded.trx_date,
    description = excluded.description,
    amount = excluded.amount,
    reference = excluded.reference,
    updated_at = now()
  returning id into transaction_id;

  return transaction_id;
end;
$$;

-- Automatically create an expense when a new item is inserted as purchased,
-- or when an existing item transitions into purchased/ready. Already-linked
-- items remain synchronized when their purchase details are edited.
create function public.sync_procurement_expense()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  linked_transaction_id uuid;
begin
  if tg_op = 'INSERT' then
    if new.status in ('purchased', 'ready') then
      perform public.upsert_procurement_expense_for_item(new.id, new.event_id, new.group_id);
    end if;
    return new;
  end if;

  select t.id
    into linked_transaction_id
    from public.transactions t
   where t.procurement_item_id = new.id
     and t.event_id = new.event_id
     and t.group_id = new.group_id
   limit 1;

  if linked_transaction_id is not null then
    perform public.upsert_procurement_expense_for_item(new.id, new.event_id, new.group_id);
  elsif new.status in ('purchased', 'ready')
    and old.status not in ('purchased', 'ready') then
    perform public.upsert_procurement_expense_for_item(new.id, new.event_id, new.group_id);
  end if;

  return new;
end;
$$;

create trigger procurement_prepare_purchase_date
  before insert or update
  on public.procurement_items
  for each row
  execute function public.prepare_procurement_purchase_date();

create trigger procurement_sync_finance_expense
  after insert or update of
    status,
    actual_unit_price,
    quantity,
    name,
    supplier,
    purchased_date,
    category_id
  on public.procurement_items
  for each row
  execute function public.sync_procurement_expense();

revoke all on function public.prepare_procurement_purchase_date() from public, anon, authenticated;
revoke all on function public.sync_procurement_expense() from public, anon, authenticated;
revoke all on function public.upsert_procurement_expense_for_item(uuid, uuid, uuid) from public, anon;
grant execute on function public.upsert_procurement_expense_for_item(uuid, uuid, uuid) to authenticated;

commit;
