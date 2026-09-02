import { NextRequest, NextResponse } from "next/server";

// TEMPORARY — delete after confirming SUPABASE_SERVICE_ROLE_KEY is present.
// This endpoint is safe: it never logs the actual key value, only ✅/❌.
// Hit GET /api/debug-env after deploying to diagnose the RLS issue.
export async function GET(_req: NextRequest) {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "✅ present"
      : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "✅ present"
      : "❌ MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ present — RLS bypass will work"
      : "❌ MISSING — this is your RLS problem. Run: npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY",
  });
}