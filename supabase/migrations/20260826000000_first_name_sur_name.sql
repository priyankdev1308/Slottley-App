-- Register/Edit Profile now collect first name and surname separately
-- instead of one combined full_name field.
alter table public.users
  rename column full_name to first_name;

alter table public.users
  add column if not exists sur_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, first_name, sur_name, use_referral_code, role, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'sur_name',
    new.raw_user_meta_data ->> 'referral_code',
    new.raw_user_meta_data ->> 'role',
    public.generate_referral_code()
  );
  return new;
end;
$$;
