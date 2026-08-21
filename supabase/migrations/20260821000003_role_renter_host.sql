-- SpaceRole renamed again: 'user' | 'spacer' -> 'renter' | 'host'.
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
  add constraint users_role_check check (role in ('renter', 'host'));
