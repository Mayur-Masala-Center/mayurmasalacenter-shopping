-- 011_product_variants.sql
-- Adds: MRP (strikethrough reference price), sizes, and a photo gallery to
-- products. The existing `price` column is kept as-is and continues to mean
-- the actual selling price ("MM Special Price") — it's what's charged in the
-- cart, checkout, bill PDF, receipt, and WhatsApp message, so nothing
-- downstream needs to change. `mrp` is purely a display field.
-- `image_url` remains the primary/cover photo; `image_urls` holds any
-- additional photos for the product gallery.

alter table products
  add column if not exists mrp numeric(10,2) check (mrp is null or mrp >= 0),
  add column if not exists sizes text[] not null default '{}',
  add column if not exists image_urls text[] not null default '{}';

comment on column products.price is 'Actual selling price charged to the customer ("MM Special Price").';
comment on column products.mrp is 'Optional MRP shown struck-through next to the selling price.';
comment on column products.sizes is 'Optional list of available sizes/variants shown as tags (e.g. 100g, 200g, 500g). Informational only — does not affect price.';
comment on column products.image_urls is 'Additional product photos beyond the primary image_url, shown in a gallery.';
