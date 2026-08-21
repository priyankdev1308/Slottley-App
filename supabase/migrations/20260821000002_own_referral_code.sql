-- `referral_code` is now the user's OWN shareable code (randomly generated
-- at signup), separate from `use_referral_code`, which holds whatever code
-- they entered at signup (i.e. whose referral they used).
alter table public.users
  add column if not exists use_referral_code text;

alter table public.users
  add constraint users_referral_code_unique unique (referral_code);

create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code text;
  code_exists boolean;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;

    select exists(select 1 from public.users where referral_code = code) into code_exists;
    if not code_exists then
      return code;
    end if;
  end loop;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, use_referral_code, role, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'referral_code',
    new.raw_user_meta_data ->> 'role',
    public.generate_referral_code()
  );
  return new;
end;
$$;
