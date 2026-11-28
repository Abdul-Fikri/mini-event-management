-- Store the login email alongside the Panitia directory record for Owner management UI.
-- Existing linked accounts are backfilled from Supabase Auth.
begin;
alter table public.members add column if not exists account_email text;
update public.members m
set account_email = lower(u.email)
from auth.users u
where m.auth_user_id = u.id
  and m.account_email is null;
create unique index if not exists members_account_email_uidx
  on public.members (lower(account_email))
  where account_email is not null;
comment on column public.members.account_email is
  'Email used by the linked Panitia Supabase Auth account; managed server-side by the Owner.';
commit;
