-- Panitia invitations: one-time, email-bound, expiring tokens.
-- Apply only after 20261108_owner_panitia_foundation.sql.
begin;
create table if not exists public.member_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null,
  email text not null check (char_length(email) <= 320),
  token_hash text not null unique check (char_length(token_hash) = 64),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (member_id, group_id)
    references public.members(id, group_id) on delete cascade
);
create index if not exists member_invitations_member_idx
  on public.member_invitations(member_id, created_at desc);
alter table public.member_invitations enable row level security;
revoke all on public.member_invitations from anon, authenticated;
grant insert on public.member_invitations to authenticated;

drop policy if exists member_invitations_owner_manage on public.member_invitations;
create policy member_invitations_owner_manage
  on public.member_invitations for all to authenticated
  using (exists (select 1 from public.groups g
    where g.id = member_invitations.group_id and g.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.groups g
    where g.id = member_invitations.group_id and g.owner_id = (select auth.uid())));

create or replace function public.claim_member_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_invitation public.member_invitations%rowtype;
  v_user_id uuid;
  v_email text;
begin
  v_user_id := (select auth.uid());
  v_email := lower(coalesce((select auth.jwt() ->> 'email'), ''));
  if v_user_id is null or v_email = '' or p_token is null or length(p_token) < 32 then
    raise exception 'Undangan tidak valid atau sesi belum aktif.';
  end if;

  select * into v_invitation
    from public.member_invitations
   where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
     and lower(email) = v_email
     and accepted_at is null
     and expires_at > now()
   for update;

  if not found then
    raise exception 'Undangan tidak valid, sudah digunakan, atau kedaluwarsa.';
  end if;

  update public.members
     set auth_user_id = v_user_id
   where id = v_invitation.member_id
     and group_id = v_invitation.group_id
     and (auth_user_id is null or auth_user_id = v_user_id);

  if not found then
    raise exception 'Anggota sudah terhubung ke akun lain.';
  end if;

  update public.member_invitations
     set accepted_at = now()
   where id = v_invitation.id;

  return v_invitation.member_id;
end;
$$;
revoke all on function public.claim_member_invitation(text) from public, anon;
grant execute on function public.claim_member_invitation(text) to authenticated;
commit;
