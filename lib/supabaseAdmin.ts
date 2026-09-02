import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// SERVER-ONLY. Uses the service role key, which bypasses Row Level Security
// entirely — never import this file from a "use client" component, and
// never send this key to the browser. It exists so a handful of narrow,
// deliberately-scoped API routes (e.g. fetching a single order by id for
// the tracking/pay pages) can work even though the "orders" table has no
// public SELECT policy at all.
//
// SUPABASE_SERVICE_ROLE_KEY is now sourced from a Cloudflare Secrets Store
// binding (see wrangler.jsonc -> secrets_store_secrets), not process.env.
// Secrets Store bindings are objects with an async .get(), not plain
// strings, so they can't be bridged into process.env the way NEXT_PUBLIC_*
// vars are — we have to read the raw Worker binding via
// getCloudflareContext() instead. This is why the function is now async.
export async function supabaseAdmin() {
  const { env } = getCloudflareContext();

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL is not set. " +
      "Check the \"vars\" block in wrangler.jsonc."
    );
  }

  const serviceKey = await env.SUPABASE_SERVICE_ROLE_KEY?.get();
  if (!serviceKey) {
    // Detailed message to distinguish "never set" from "binding misconfigured".
    throw new Error(
      "[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is not set. \n" +
      "1. Confirm a \"secrets_store_secrets\" entry exists in wrangler.jsonc " +
      "with binding: \"SUPABASE_SERVICE_ROLE_KEY\".\n" +
      "2. Confirm the secret exists in that Secrets Store " +
      "(Cloudflare dashboard -> Secrets Store, or `wrangler secrets-store secret list`).\n" +
      "3. Redeploy — binding changes require a new deploy to take effect."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}