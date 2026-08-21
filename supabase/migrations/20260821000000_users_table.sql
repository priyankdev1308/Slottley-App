-- Public profile row for every authenticated user, kept in sync with auth.users.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  referral_code text,
  role text check (role in ('find', 'list')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own row"
  on public.users for update
  using (auth.uid() = id);

-- Auto-creates the profile row the moment a new auth user is created —
-- runs as the table owner (security definer), so it works even before the
-- user has confirmed their email and has no session/RLS context yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, referral_code, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'referral_code',
    new.raw_user_meta_data ->> 'role'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
