-- Price breakdown + a human-readable booking reference, on top of the
-- rate/total_price snapshot already on book_space.
-- place_price/platform_commission/referral_credit are left nullable (no app
-- code writes them yet — the commission % and referral-credit lookup need
-- their own business rules before that's wired up).
alter table public.book_space
  add column place_price numeric(10, 2),
  add column platform_commission numeric(10, 2),
  add column referral_credit numeric(10, 2),
  add column payment_details text not null default '';

-- booking_id: a human-readable reference like #BK2026125898 — #BK + the
-- current year + a zero-padded sequence number, guaranteed unique (unlike a
-- random number) via a backing sequence.
create sequence public.book_space_booking_seq;

alter table public.book_space
  add column booking_id text not null default (
    '#BK' || to_char(now(), 'YYYY') || lpad(nextval('public.book_space_booking_seq')::text, 6, '0')
  );

alter table public.book_space
  add constraint book_space_booking_id_key unique (booking_id);
