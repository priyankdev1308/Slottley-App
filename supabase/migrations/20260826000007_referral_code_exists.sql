-- Register lets a user optionally enter someone else's referral code. That
-- code was never validated — any string, including a typo or a made-up
-- one, got stored into use_referral_code and the signup went through
-- anyway. This function lets the (still unauthenticated, pre-signup)
-- client check whether a code actually belongs to a real user, without
-- exposing anything else about that user — public.users itself has no
-- anonymous-read policy, so a plain SELECT isn't an option here.
create or replace function public.referral_code_exists(code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.users where referral_code = upper(trim(code))
  );
$$;

grant execute on function public.referral_code_exists(text) to anon, authenticated;
