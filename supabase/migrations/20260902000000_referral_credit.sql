-- Credits the referrer's wallet_balance by £10 whenever a new user signs up
-- entering that referrer's code. Runs server-side (not app-triggered) so it
-- can't be skipped or spoofed from the client.
create or replace function public.award_referral_credit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.use_referral_code is not null then
    update public.users
    set wallet_balance = coalesce(wallet_balance, 0) + 10
    where referral_code = new.use_referral_code;
  end if;
  return new;
end;
$$;

create trigger on_user_referred
  after insert on public.users
  for each row execute function public.award_referral_credit();
