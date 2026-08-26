-- When the admin panel rejects a submission (is_verified -> 2), clear the
-- uploaded document paths so the user's next visit to Get Verified shows
-- empty upload slots ready for a fresh submission instead of the rejected
-- files.
--
-- This does NOT also delete the underlying storage objects: Supabase
-- blocks direct `delete from storage.objects` from SQL/triggers
-- (storage.protect_delete()) specifically to stop this class of bug —
-- orphaned file bytes if the delete doesn't also go through the Storage
-- API. Removing the actual files needs a proper Storage API call (e.g. an
-- Edge Function invoked via a Database Webhook on this same update), which
-- is a separate, bigger piece of infrastructure than a plain trigger can
-- do safely.
create or replace function public.handle_verification_rejected()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_verified = 2 and old.is_verified is distinct from 2 then
    new.identity_images := null;
    new.insurance_certificate := null;
  end if;

  return new;
end;
$$;

drop trigger if exists on_verification_rejected on public.verified_users;

create trigger on_verification_rejected
  before update on public.verified_users
  for each row execute function public.handle_verification_rejected();
