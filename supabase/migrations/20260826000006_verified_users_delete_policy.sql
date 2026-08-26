-- Lets the app itself delete a rejected document via the Storage API when
-- the user taps "Remove" on Get Verified — the earlier migration only
-- covered select/insert/update, not delete.
create policy "Users can delete their own verification documents"
  on storage.objects for delete
  using (
    bucket_id = 'verified_users'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
