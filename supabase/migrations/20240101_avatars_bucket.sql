-- Create public avatars bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,   -- 2 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];

-- Allow authenticated users to upload/update/delete only their own folder
create policy "Users manage own avatar" on storage.objects
  for all
  to authenticated
  using  (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
create policy "Public read avatars" on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');
