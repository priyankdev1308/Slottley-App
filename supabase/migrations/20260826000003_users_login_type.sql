-- Track how each account was created. Supabase Auth already records which
-- provider completed the sign-up on the auth user itself
-- (raw_app_meta_data.provider — 'email' for normal sign-up, 'google' for
-- Google sign-in, 'apple' once that's wired up), so this just copies that
-- value across instead of needing any client-side change.
alter table public.users
  add column if not exists login_type text;

-- Backfill existing rows from the same source the trigger below now uses,
-- so accounts created before this migration aren't left with a blank type.
update public.users u
set login_type = a.raw_app_meta_data ->> 'provider'
from auth.users a
where u.id = a.id and u.login_type is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (
    id, email, first_name, sur_name, login_type,
    use_referral_code, role, referral_code
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'given_name'),
    coalesce(new.raw_user_meta_data ->> 'sur_name', new.raw_user_meta_data ->> 'family_name'),
    new.raw_app_meta_data ->> 'provider',
    new.raw_user_meta_data ->> 'referral_code',
    new.raw_user_meta_data ->> 'role',
    public.generate_referral_code()
  );
  return new;
end;
$$;
