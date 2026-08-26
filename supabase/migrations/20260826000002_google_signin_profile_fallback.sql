-- Google sign-in doesn't send our own `first_name`/`sur_name` metadata keys
-- — it sends given_name/family_name instead. Fall back to those so a
-- Google user's name isn't blank on first login. `profile_image` is
-- deliberately left alone: it always holds a path in our own storage
-- bucket, set only when the user uploads a photo via Edit Profile — never
-- Google's external picture URL. `role` is also left out of the fallback:
-- Google never provides one, so a fresh Google identity lands with
-- role = null, which the app uses to tell "signed in but never completed
-- registration" apart from a real account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (
    id, email, first_name, sur_name,
    use_referral_code, role, referral_code
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'given_name'),
    coalesce(new.raw_user_meta_data ->> 'sur_name', new.raw_user_meta_data ->> 'family_name'),
    new.raw_user_meta_data ->> 'referral_code',
    new.raw_user_meta_data ->> 'role',
    public.generate_referral_code()
  );
  return new;
end;
$$;
