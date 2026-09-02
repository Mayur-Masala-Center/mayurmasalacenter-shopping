import { NextRequest, NextResponse } from "next/server";

// TEMPORARY diagnostic route — DELETE THIS FILE after confirming the fix works.
// Hit GET /api/debug-env to see which env vars are visible to the Worker.
// This never logs the actual key value, only whether it is present/absent.
export async function GET(_req: NextRequest) {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "✅ present"
      : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "✅ present"
      : "❌ MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ present"
      : "❌ MISSING — this is your RLS problem",
    NODE_ENV: process.env.NODE_ENV ?? "(not set)",
  });
}