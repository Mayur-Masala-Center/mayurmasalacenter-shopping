import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateCheckout, normalizePhone } from "@/lib/validation";
import { lookupPincode } from "@/lib/pincode";
import {
  resolveDeliveryZone,
  getZoneCharge,
  DEFAULT_DELIVERY_ZONES,
  DeliveryZoneSettings,
} from "@/lib/deliveryZones";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateBillPdfBytes } from "@/lib/billPdf";
import { Order } from "@/lib/types";

// Uses the anon key — inserts are allowed by RLS policy "public insert orders".
// This route exists mainly to run server-side validation + generate the
// order number before the row is written, so client tampering can't bypass checks.
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const {
      name,
      phone,
      address_line1,
      address_line2,
      pincode,
      city,
      state,
      items,
      honeypot,
    } = body;

    // Guard against missing/non-string required fields before they hit
    // validateCheckout, which calls .trim() on them and would otherwise
    // throw a TypeError (surfacing as an opaque 500) instead of a clean 400.
    const requiredStrings = { name, phone, address_line1, pincode, city };
    for (const [key, value] of Object.entries(requiredStrings)) {
      if (typeof value !== "string") {
        return NextResponse.json(
          { error: "validation_failed", details: { [key]: "This field is required." } },
          { status: 400 }
        );
      }
    }

    // --- Authoritative pincode check -----------------------------------
    // Never trust the city/state the client sent. Re-verify the pincode
    // against India Post ourselves. Orders are only accepted for pincodes
    // India Post actually recognizes, anywhere in India.
    const pincodeStr = typeof pincode === "string" ? pincode.trim() : "";
    const pincodeResult = await lookupPincode(pincodeStr);

    const check = validateCheckout({
      name,
      phone,
      address_line1,
      address_line2,
      pincode: pincodeStr,
      // Use the server-verified city/state as the source of truth once
      // found; fall back to client-entered values only for shape validation
      // when the lookup didn't return anything (in which case pincodeVerified
      // below will block the order anyway).
      city: pincodeResult.found ? pincodeResult.city || city : city,
      state: pincodeResult.found ? pincodeResult.state : state,
      honeypot,
      pincodeVerified: pincodeResult.found,
    });
    if (!check.valid) {
      return NextResponse.json({ error: "validation_failed", details: check.errors }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, i: any) => sum + Number(i.price) * Number(i.qty),
      0
    );

    const client = supabase();

    // The service-role client is only needed for two best-effort steps below
    // (reading site_settings with certainty, and auto-generating the bill).
    // If SUPABASE_SERVICE_ROLE_KEY isn't configured in this environment,
    // don't let that take down order creation entirely — log it clearly and
    // degrade gracefully instead. (The DB trigger from migration 010 also
    // independently recomputes delivery_charge/total server-side, so pricing
    // integrity doesn't depend on this succeeding.)
    let admin: ReturnType<typeof supabaseAdmin> | null = null;
    try {
      admin = supabaseAdmin();
    } catch (adminInitErr) {
      console.error(
        "supabaseAdmin unavailable — SUPABASE_SERVICE_ROLE_KEY is likely missing from this deployment's env vars",
        adminInitErr
      );
    }

    // --- Delivery zone + charge (server-resolved, never client-trusted) --
    const resolvedCity = pincodeResult.city || city;
    const resolvedState = pincodeResult.state || state || "Maharashtra";
    const zoneKey = resolveDeliveryZone(resolvedCity, resolvedState);

    let zoneSettings: DeliveryZoneSettings = DEFAULT_DELIVERY_ZONES;
    try {
      const { data: zoneRow } = await (admin ?? client)
        .from("site_settings")
        .select("value")
        .eq("key", "delivery_zones")
        .maybeSingle();
      if (zoneRow?.value) zoneSettings = zoneRow.value as DeliveryZoneSettings;
    } catch (zoneErr) {
      console.error("delivery zone settings lookup failed, using defaults", zoneErr);
    }

    const deliveryCharge = getZoneCharge(zoneSettings, zoneKey);
    const total = subtotal + deliveryCharge;

    const { data: orderNumberData, error: orderNumberError } = await client.rpc(
      "generate_order_number"
    );
    if (orderNumberError) {
      console.error("order number rpc error", orderNumberError);
    }
    const orderNumber =
      orderNumberData || `MM-${Date.now().toString().slice(-8)}`;

    const orderPayload = {
      order_number: orderNumber,
      customer_name: name.trim(),
      phone: normalizePhone(phone),
      is_whatsapp: true,
      address_line1: address_line1.trim(),
      address_line2: address_line2?.trim() || null,
      pincode: pincodeStr,
      city: resolvedCity.trim(),
      state: resolvedState.trim(),
      items,
      subtotal,
      delivery_charge: deliveryCharge,
      delivery_zone: zoneKey,
      total,
      status: "received",
      payment_received: false,
    };

    // Insert via the service-role client. Migration 008 removed anonymous
    // SELECT on `orders`, and `.select().single()` after an insert asks
    // PostgREST to RETURNING the row — which Postgres evaluates against the
    // SELECT policy, not just INSERT's WITH CHECK. Using the anon client here
    // caused the insert to actually succeed but the RETURNING to be blocked,
    // surfacing as the same "violates row-level security policy" error as a
    // genuine insert failure. The DB trigger from migration 010 still applies
    // regardless of which client/role performs the insert, so this doesn't
    // weaken any server-side validation.
    let data, error;
    if (admin) {
      ({ data, error } = await admin.from("orders").insert(orderPayload).select().single());
    } else {
      // Degraded fallback: admin client unavailable in this environment.
      // Anon insert still works (WITH CHECK allows it), but we can't read
      // the row back, so we build the returned object from what we already
      // know instead of chaining .select().
      ({ error } = await client.from("orders").insert(orderPayload));
      data = error ? null : { id: undefined, ...orderPayload };
    }

    if (error) {
      console.error("order insert error", error);
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }

    let order = data as Order;

    // --- Auto-generate the bill immediately -----------------------------
    // The bill (and its public URL) should exist from the moment the order
    // is placed, so every WhatsApp status update from here on — including
    // the very first "Order Received" message — can include the bill link.
    // Failure here should never block order placement, so it's best-effort.
    try {
      if (!admin) throw new Error("admin client unavailable, skipping auto bill");
      const pdfBytes = await generateBillPdfBytes(order);
      const path = `${order.id}/${Date.now()}-bill.pdf`;

      const { error: uploadError } = await admin.storage
        .from("bills")
        .upload(path, Buffer.from(pdfBytes), { contentType: "application/pdf", upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = admin.storage.from("bills").getPublicUrl(path);
        const { data: updated, error: updateError } = await admin
          .from("orders")
          .update({ bill_url: publicUrlData.publicUrl })
          .eq("id", order.id)
          .select()
          .single();
        if (!updateError && updated) order = updated as Order;
      } else {
        console.error("auto bill upload error", uploadError);
      }
    } catch (billErr) {
      console.error("auto bill generation error", billErr);
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error(
      "order route error",
      e instanceof Error ? { message: e.message, stack: e.stack } : e
    );
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}