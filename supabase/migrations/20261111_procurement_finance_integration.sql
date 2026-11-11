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
    new.purchased_date := (now() at time zone 'Asia/Jakarta')::date;
  end if;

  return new;
end;
$$;

-- Keep exactly one finance expense in sync with each purchased procurement item.
-- This is an invoker trigger: the existing Owner RLS policies still apply.
create function public.sync_procurement_expense()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  linked_transaction_id uuid;
  expense_amount bigint;
  expense_date date;
  expense_reference text;
begin
  select t.id
    into linked_transaction_id
    from public.transactions t
   where t.procurement_item_id = new.id
     and t.event_id = new.event_id
     and t.group_id = new.group_id
   limit 1;

  -- A merely requested/ordered item is not an actual cash expense.
  -- If a linked expense already exists, keep it synchronized even if the
  -- procurement status is later corrected; money already spent stays recorded.
  if new.status not in ('purchased', 'ready') and linked_transaction_id is null then
    return new;
  end if;

  if new.actual_unit_price is null or new.actual_unit_price <= 0 then
    raise exception 'Harga aktual wajib lebih dari Rp0 sebelum pembelian dicatat ke Keuangan.'
      using errcode = '23514';
  end if;

  if round(new.actual_unit_price * new.quantity) <= 0
     or round(new.actual_unit_price * new.quantity) > 9007199254740991 then
    raise exception 'Total pembelian tidak valid atau melebihi batas nominal yang didukung.'
      using errcode = '23514';
  end if;
  expense_amount := round(new.actual_unit_price * new.quantity)::bigint;

  expense_date := coalesce(
    new.purchased_date,
    (now() at time zone 'Asia/Jakarta')::date
  );
  expense_reference := left(
    'Pengadaan otomatis' ||
    case when new.supplier is not null then ' · ' || new.supplier else '' end,
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
    new.group_id,
    new.event_id,
    new.category_id,
    'expense',
    expense_date,
    left('Pembelian: ' || new.name, 200),
    expense_amount,
    expense_reference,
    new.id
  )
  on conflict (procurement_item_id)
  do update set
    category_id = excluded.category_id,
    trx_date = excluded.trx_date,
    description = excluded.description,
    amount = excluded.amount,
    reference = excluded.reference,
    updated_at = now();

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

commit;
