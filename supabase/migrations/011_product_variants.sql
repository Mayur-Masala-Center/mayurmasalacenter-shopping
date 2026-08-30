-- 011_product_variants.sql
-- Adds: MRP, sizes, and a photo gallery to products. The existing `price`
-- column is kept as-is and continues to mean the actual selling price
-- ("MM Special Price") — it's what's charged in the cart, checkout, bill
-- PDF, receipt, and WhatsApp message, so nothing downstream needs to
-- change. `image_url` remains the primary/cover photo; `image_urls` holds
-- any additional photos for the product gallery.
--
-- Name, Description, MRP, MM Special Price, and Sizes are all required
-- fields in the admin UI going forward. This migration does NOT enforce
-- that at the database level (no NOT NULL/empty-array checks added), so
-- existing products created before this change can keep their current
-- blank mrp/sizes values without breaking. Only new saves from the admin
-- form are forced to fill them in.

alter table products
  add column if not exists mrp numeric(10,2) check (mrp is null or mrp >= 0),
  add column if not exists sizes text[] not null default '{}',
  add column if not exists image_urls text[] not null default '{}';

comment on column products.price is 'Actual selling price charged to the customer ("MM Special Price").';
comment on column products.mrp is 'MRP shown alongside the selling price. Required in the admin UI for new/edited products.';
comment on column products.sizes is 'List of available sizes/variants shown as tags (e.g. 100g, 200g, 500g). Required in the admin UI for new/edited products.';
comment on column products.image_urls is 'Additional product photos beyond the primary image_url, shown in a gallery.';
