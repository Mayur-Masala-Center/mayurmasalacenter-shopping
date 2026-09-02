// Hand-maintained type declarations for Cloudflare Worker bindings.
//
// Normally `npx wrangler types` generates this file automatically from
// wrangler.jsonc. It isn't run as part of this project's build (`bun run
// build` invokes Next.js directly), so this file is committed by hand
// instead and must be kept in sync manually whenever a binding is added or
// removed in wrangler.jsonc.
//
// If you'd rather not maintain this by hand, add `"prebuild": "wrangler
// types"` to package.json's "scripts" so it regenerates automatically
// before every build (requires wrangler to run in the CI environment).

interface SecretsStoreSecret {
    get(): Promise<string>;
  }
  
  interface CloudflareEnv {
    // --- Plain vars (from wrangler.jsonc "vars") -------------------------
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_SHOP_WHATSAPP: string;
    NEXT_PUBLIC_SHOP_NAME: string;
    NEXT_PUBLIC_SHOP_ADDRESS: string;
    NEXT_PUBLIC_SHOP_PHONE: string;
    NEXT_PUBLIC_SITE_URL: string;
  
    // --- Secrets Store bindings (from wrangler.jsonc "secrets_store_secrets") ---
    SUPABASE_SERVICE_ROLE_KEY: SecretsStoreSecret;
  
    // --- Other bindings (from wrangler.jsonc) -----------------------------
    ASSETS: Fetcher;
  }