import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service role key, which bypasses Row Level Security
// entirely — never import this file from a "use client" component, and
// never send this key to the browser. It exists so a handful of narrow,
// deliberately-scoped API routes (e.g. fetching a single order by id for
// the tracking/pay pages) can work even though the "orders" table has no
// public SELECT policy at all.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL is not set. " +
      "Check your wrangler.jsonc vars block."
    );
  }

  if (!serviceKey) {
    // Detailed message to distinguish "never set" from "not bridged by open-next".
    // If you see this in Cloudflare logs after setting the secret, it means
    // cloudflareEnv: true is missing from open-next.config.ts — the secret
    // exists on the Worker env binding but isn't reaching process.env.
    throw new Error(
      "[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Run: npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY\n" +
      "Then verify open-next.config.ts has `cloudflareEnv: true` so the " +
      "secret is bridged from the Worker binding into process.env."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}