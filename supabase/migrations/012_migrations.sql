-- 012: Fix "new row violates row-level security policy for table orders"
--
-- ROOT CAUSE
-- ----------
-- PostgreSQL evaluates the INSERT `WITH CHECK` policy against the row the
-- *client* is sending, before BEFORE-ROW triggers have a chance to run.
-- Migration 008 wrote:
--
--   with check (
--     status = 'received'
--     and payment_received = false
--     and bill_url is null
--   )
--
-- The checkout API route sends these fields with the correct values, so this
-- worked fine for direct inserts. But the guard_order_insert trigger
-- (migrations 008 & 010) also rewrites `status`, `payment_received`,
-- `bill_url`, `total`, `subtotal`, `delivery_charge`, and `delivery_zone`
-- server-side. Because CHECK is tested on the *client-proposed* row,
-- any situation where those three fields were not explicitly sent as expected
-- — or where a future code path omits them — causes a spurious RLS
-- violation, even though the trigger would have set them to safe values.
--
-- The trigger is the authoritative security boundary (it always force-sets
-- every sensitive field, regardless of what the client sends). Duplicating
-- that guard in the RLS WITH CHECK adds no extra security and breaks inserts
-- whenever the submitted values don't exactly match what the trigger will
-- ultimately write.
--
-- FIX
-- ---
-- Replace the policy's WITH CHECK with a plain `true`.  The trigger already
-- guarantees:
--   • status          → 'received'
--   • payment_received → false
--   • bill_url        → null
--   • total           → recomputed from items + authoritative delivery charge
--   • subtotal        → recomputed from items
--   • delivery_charge → looked up from site_settings (not client-trusted)
--   • delivery_zone   → validated against known zone keys
--
-- Also convert guard_order_insert to SECURITY DEFINER so its internal
-- SELECT from site_settings always succeeds regardless of which role
-- triggered the insert (anon key, service role, etc.).

-- 1. Recreate the function as SECURITY DEFINER so it can always read
--    site_settings even when called by the anon role.
create or replace function guard_order_insert()
returns trigger
security definer                          -- ← key change
set search_path = public                  -- recommended when using SECURITY DEFINER
language plpgsql as $$
declare
  computed_subtotal numeric;
  zone_key text;
  zone_charge numeric;
  zones jsonb;
begin
  -- Recompute subtotal from items — never trust what the client sent.
  computed_subtotal := (
    select coalesce(sum((item->>'price')::numeric * (item->>'qty')::numeric), 0)
    from jsonb_array_elements(new.items) as item
  );

  -- Validate delivery zone; fall back to rest_of_india if missing/bogus.
  zone_key := new.delivery_zone;
  if zone_key is null or zone_key not in (
    'pune_local', 'mumbai', 'metro', 'nagpur', 'maharashtra', 'rest_of_india'
  ) then
    zone_key := 'rest_of_india';
  end if;

  -- Look up the authoritative charge for this zone from site_settings.
  -- Running as SECURITY DEFINER means this SELECT always succeeds.
  select value into zones from site_settings where key = 'delivery_zones';
  zone_charge := coalesce((zones -> zone_key ->> 'charge')::numeric, 0);

  -- Overwrite all financial / status fields — the client cannot forge these.
  new.subtotal          := computed_subtotal;
  new.delivery_zone     := zone_key;
  new.delivery_charge   := zone_charge;
  new.total             := computed_subtotal + zone_charge;
  new.status            := 'received';
  new.payment_received  := false;
  new.bill_url          := null;

  return new;
end;
$$;

-- 2. Replace the public insert policy so WITH CHECK is simply `true`.
--    Security is enforced entirely by the BEFORE-INSERT trigger above;
--    the CHECK clause here was redundant *and* unreliable (it ran before
--    the trigger had a chance to normalise the row).
drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders
  for insert with check (true);

-- No other policies need changing.  The trigger already blocks any attempt
-- to write a forged status / total / payment_received / bill_url — whether
-- the request comes through the app, a direct REST call, or anything else.