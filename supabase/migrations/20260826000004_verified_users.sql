-- Get Verified: one submission per user, reviewed from an external admin
-- panel that flips is_verified (0 pending / 1 approved / 2 rejected).
alter table public.verified_users
  alter column id set default gen_random_uuid();

alter table public.verified_users
  alter column is_verified set default 0;

alter table public.verified_users
  add constraint verified_users_user_id_fkey
  foreign key (user_id) references public.users (id) on delete cascade;

alter table public.verified_users
  add constraint verified_users_user_id_key unique (user_id);

alter table public.verified_users enable row level security;

create policy "Users can view their own verification row"
  on public.verified_users for select
  using (auth.uid() = user_id);

create policy "Users can submit their own verification row"
  on public.verified_users for insert
  with check (auth.uid() = user_id);

create policy "Users can resubmit their own verification row"
  on public.verified_users for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Identity documents are sensitive — unlike profile_images this bucket
-- stays private. Each user may only read/write inside their own
-- `{user_id}/...` folder; the admin panel reviews via a service-role key,
-- which bypasses RLS entirely, so it needs no policy of its own here.
create policy "Users can view their own verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verified_users'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload their own verification documents"
  on storage.objects for insert
  with check (
    bucket_id = 'verified_users'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can replace their own verification documents"
  on storage.objects for update
  using (
    bucket_id = 'verified_users'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
