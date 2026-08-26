-- Edit Profile now also collects the user's address and profile photo.
alter table public.users
  add column if not exists location text;

alter table public.users
  add column if not exists profile_image text;

-- Photos live in the `profile_images` storage bucket (created manually in
-- the dashboard) under a `{user_id}/...` path. Anyone can view an avatar,
-- but a user may only write inside their own folder.
--
-- The bucket must also be marked `public` — getPublicUrl() only works
-- against the /object/public/ endpoint, which bypasses storage.objects RLS
-- entirely and is gated purely by this flag. Without it, the client gets
-- a URL that always 400s no matter what RLS policies exist below.
update storage.buckets set public = true where id = 'profile_images';

create policy "Profile images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'profile_images');

create policy "Users can upload their own profile image"
  on storage.objects for insert
  with check (
    bucket_id = 'profile_images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own profile image"
  on storage.objects for update
  using (
    bucket_id = 'profile_images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
