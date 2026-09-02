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
// NEXT_PUBLIC_SUPABASE_URL is a plain string var, so it's already bridged
// into process.env like before — no change needed there.
//
// SUPABASE_SERVICE_ROLE_KEY now comes from a Cloudflare Secrets Store
// binding (see wrangler.jsonc -> secrets_store_secrets). That binding is an
// object with an async .get(), not a string, so it can't be bridged into
// process.env the same way — it has to be read from the raw Worker env via
// getCloudflareContext(). This is why the function is async.
export async function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL is not set. " +
      "Check the \"vars\" block in wrangler.jsonc."
    );
  }

  const { env } = getCloudflareContext();
  const serviceKey = await env.SUPABASE_SERVICE_ROLE_KEY?.get();
  if (!serviceKey) {
    // Detailed message to distinguish "never set" from "binding misconfigured".
    throw new Error(
      "[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is not set. \n" +
      "1. Confirm a \"secrets_store_secrets\" entry exists in wrangler.jsonc " +
      "with binding: \"SUPABASE_SERVICE_ROLE_KEY\".\n" +
      "2. Confirm the secret exists in that Secrets Store " +
      "(Cloudflare dashboard -> Secrets Store, or `wrangler secrets-store secret list`).\n" +
      "3. Redeploy — binding changes require a new deploy to take effect.\n" +
      "4. If the TYPE error mentions CloudflareEnv, run `npx wrangler types` " +
      "and commit the regenerated type file."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}