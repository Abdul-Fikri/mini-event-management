-- Distinguish purchases from borrowing and existing inventory.
-- Existing records default to purchase so their finance linkage remains unchanged.
begin;

alter table public.procurement_items
  add column if not exists procurement_type text not null default 'purchase',
  add column if not exists expected_return_date date,
  add column if not exists returned_at timestamptz;

alter table public.procurement_items
  drop constraint if exists procurement_items_procurement_type_check,
  drop constraint if exists procurement_items_non_purchase_finance_fields_check,
  drop constraint if exists procurement_items_non_purchase_status_check,
  drop constraint if exists procurement_items_return_fields_check;

alter table public.procurement_items
  add constraint procurement_items_procurement_type_check
    check (procurement_type in ('purchase', 'borrow', 'inventory')),
  add constraint procurement_items_non_purchase_finance_fields_check
    check (
      procurement_type = 'purchase'
      or (
        est_unit_price is null
        and actual_unit_price is null
        and category_id is null
        and purchased_date is null
      )
    ),
  add constraint procurement_items_non_purchase_status_check
    check (
      procurement_type = 'purchase'
      or status not in ('ordered', 'purchased')
    ),
  add constraint procurement_items_return_fields_check
    check (
      (procurement_type = 'borrow')
      or (expected_return_date is null and returned_at is null)
    );

-- A purchase date is only meaningful for purchase-type procurement.
create or replace function public.prepare_procurement_purchase_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.procurement_type = 'purchase'
     and new.status in ('purchased', 'ready')
     and new.purchased_date is null then
    if tg_op = 'INSERT' then
      new.purchased_date := (now() at time zone 'Asia/Jakarta')::date;
    elsif old.status not in ('purchased', 'ready')
       or old.procurement_type is distinct from 'purchase' then
      new.purchased_date := (now() at time zone 'Asia/Jakarta')::date;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.upsert_procurement_expense_for_item(
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

  if item.procurement_type <> 'purchase' then
    raise exception 'Hanya jenis pengadaan Pembelian yang dapat dicatat sebagai pengeluaran.'
      using errcode = '23514';
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
    group_id, event_id, category_id, type, trx_date, description,
    amount, reference, procurement_item_id
  )
  values (
    item.group_id, item.event_id, item.category_id, 'expense',
    coalesce(item.purchased_date, (now() at time zone 'Asia/Jakarta')::date),
    left('Pembelian: ' || item.name, 200),
    expense_amount, expense_reference, item.id
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

create or replace function public.sync_procurement_expense()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  linked_transaction_id uuid;
begin
  if tg_op = 'INSERT' then
    if new.procurement_type = 'purchase'
       and new.status in ('purchased', 'ready') then
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

  if new.procurement_type <> 'purchase' then
    if linked_transaction_id is not null then
      raise exception 'Item yang sudah terhubung ke transaksi Keuangan tidak dapat diubah menjadi Peminjaman atau Inventaris.'
        using errcode = '23514';
    end if;
    return new;
  end if;

  if linked_transaction_id is not null then
    perform public.upsert_procurement_expense_for_item(new.id, new.event_id, new.group_id);
  elsif new.status in ('purchased', 'ready')
    and (old.status not in ('purchased', 'ready')
      or old.procurement_type is distinct from 'purchase') then
    perform public.upsert_procurement_expense_for_item(new.id, new.event_id, new.group_id);
  end if;

  return new;
end;
$$;

drop trigger if exists procurement_sync_finance_expense on public.procurement_items;
create trigger procurement_sync_finance_expense
  after insert or update of
    procurement_type,
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

commit;