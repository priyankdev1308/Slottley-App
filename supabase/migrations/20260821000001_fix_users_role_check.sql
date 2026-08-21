-- The SpaceRole app type was renamed from 'find' | 'list' to 'user' | 'spacer',
-- but the CHECK constraint on public.users.role still only allowed the old
-- values, so every new signup failed with "Database error saving new user".

-- Normalize any rows left over from before the rename (e.g. QA test accounts
-- created with the old 'find'/'list' values) so the new constraint can be
-- added without failing existing-row validation.
update public.users set role = 'user' where role = 'find' or role is null;
update public.users set role = 'spacer' where role = 'list';

do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.users'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%role%';

  if con_name is not null then
    execute format('alter table public.users drop constraint %I', con_name);
  end if;
end $$;

alter table public.users
  add constraint users_role_check check (role in ('user', 'spacer'));
