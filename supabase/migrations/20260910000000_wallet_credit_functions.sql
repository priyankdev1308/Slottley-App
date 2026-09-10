-- Lets create-booking-payment spend a user's referral wallet_balance
-- against a booking's total atomically. A plain UPDATE from the Edge
-- Function can't safely do "wallet_balance = wallet_balance - x" (no
-- read-then-write race protection via the JS client), so this does it in
-- one locked statement instead — the row lock from the SELECT ... FOR
-- UPDATE below prevents the same credit being spent twice by two
-- overlapping booking payments. Returns the amount actually spent (may be
-- less than p_amount if another request already spent some of it).
create or replace function public.spend_wallet_credit(p_user_id uuid, p_amount numeric)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_available numeric;
  v_spend numeric;
begin
  select coalesce(wallet_balance, 0) into v_available
  from public.users
  where id = p_user_id
  for update;

  v_spend := least(greatest(p_amount, 0), coalesce(v_available, 0));

  if v_spend > 0 then
    update public.users
    set wallet_balance = wallet_balance - v_spend
    where id = p_user_id;
  end if;

  return v_spend;
end;
$$;

-- Only postgres/service_role may call this — otherwise any authenticated
-- client could invoke it directly via supabase.rpc(...) and drain or
-- manipulate another user's wallet balance.
revoke execute on function public.spend_wallet_credit(uuid, numeric) from public, anon, authenticated;

-- Gives back wallet credit that was spent but then not actually used —
-- e.g. the remaining card charge failed after the credit was already
-- deducted, so the booking wasn't created and the credit shouldn't be lost.
create or replace function public.refund_wallet_credit(p_user_id uuid, p_amount numeric)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_amount > 0 then
    update public.users
    set wallet_balance = coalesce(wallet_balance, 0) + p_amount
    where id = p_user_id;
  end if;
end;
$$;

revoke execute on function public.refund_wallet_credit(uuid, numeric) from public, anon, authenticated;
