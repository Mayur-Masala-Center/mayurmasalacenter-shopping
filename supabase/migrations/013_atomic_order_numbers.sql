-- 013. ATOMIC ORDER NUMBER GENERATION -------------------------------------
-- The previous generate_order_number() (schema.sql) computed the daily
-- sequence with `select count(*) + 1 from orders where order_number like
-- ...`. That's a classic check-then-act race: two concurrent checkout
-- requests can both run the count before either row is inserted, both
-- compute the same order_number, and the second insert then fails with
-- "duplicate key value violates unique constraint orders_order_number_key".
--
-- Fix: keep a real per-day counter row and bump it atomically with
-- INSERT ... ON CONFLICT DO UPDATE ... RETURNING. Postgres guarantees that
-- statement is safe under concurrent execution (the row lock during the
-- UPDATE serializes concurrent callers), so two simultaneous callers can
-- never receive the same sequence number for the same day.

create table if not exists order_number_counters (
  day_str text primary key,
  last_seq int not null default 0
);

-- No public access needed — only ever touched via generate_order_number(),
-- which runs as the function owner (security definer) below.
alter table order_number_counters enable row level security;

create or replace function generate_order_number()
returns text as $$
declare
  today_str text := to_char(now(), 'YYYYMMDD');
  seq_num int;
  result text;
begin
  insert into order_number_counters (day_str, last_seq)
  values (today_str, 1)
  on conflict (day_str)
  do update set last_seq = order_number_counters.last_seq + 1
  returning last_seq into seq_num;

  result := 'MM-' || today_str || '-' || lpad(seq_num::text, 4, '0');
  return result;
end;
$$ language plpgsql security definer;
