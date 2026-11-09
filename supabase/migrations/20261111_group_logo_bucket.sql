-- Ensure the public group logo bucket exists with the same constraints
-- enforced by the upload form. Public access applies to image delivery only;
-- authenticated writes remain governed by the existing owner-only policies
-- from 20261110_group_logos.sql.
begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'group-logos',
  'group-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
