import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// cloudflareEnvPlugin bridges ALL Cloudflare bindings — including secrets set
// via `wrangler secret put` — into process.env so server-side code can read
// them with the normal process.env.VARIABLE_NAME pattern.
//
// Without this, secrets exist on the Worker's `env` object but are NOT
// automatically reflected in process.env, which is why supabaseAdmin() was
// throwing "Missing SUPABASE_SERVICE_ROLE_KEY" and order routes fell back to
// the anon key (blocked by RLS migration 008).
export default defineCloudflareConfig({
  cloudflareEnv: true,
});