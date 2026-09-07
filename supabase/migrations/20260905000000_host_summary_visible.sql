-- Renters need to see a host's name/photo on Place Detail (fetchHostSummary),
-- but the existing "Users can view their own row" policy only lets a user
-- read their own row — any other user's row (including a host's, from a
-- renter's session) is invisible under RLS regardless of which columns the
-- client selects. Scoped to hosts with at least one Active place, mirroring
-- the existing "Anyone can view active places" visibility.
create policy "Anyone can view basic info of hosts with active places"
  on public.users for select
  using (
    exists (
      select 1 from public.places
      where places.host_id = users.id
        and places.status = 'Active'
    )
  );
