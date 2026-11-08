-- Optional group logo and owner-only Storage management.
-- Apply after the existing owner/panitia and invitation migrations.
begin;

alter table public.groups
  add column if not exists logo_url text;

-- The bucket is public for image delivery. Writes remain restricted to
-- authenticated owners and objects stored under their own group UUID folder.
drop policy if exists group_logos_owner_insert on storage.objects;
create policy group_logos_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'group-logos'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.groups g
      where g.id = ((storage.foldername(name))[1])::uuid
        and g.owner_id = (select auth.uid())
    )
  );

drop policy if exists group_logos_owner_update on storage.objects;
create policy group_logos_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'group-logos'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.groups g
      where g.id = ((storage.foldername(name))[1])::uuid
        and g.owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'group-logos'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.groups g
      where g.id = ((storage.foldername(name))[1])::uuid
        and g.owner_id = (select auth.uid())
    )
  );

drop policy if exists group_logos_owner_delete on storage.objects;
create policy group_logos_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'group-logos'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and exists (
      select 1
      from public.groups g
      where g.id = ((storage.foldername(name))[1])::uuid
        and g.owner_id = (select auth.uid())
    )
  );

commit;
