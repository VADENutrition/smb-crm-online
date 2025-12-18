import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const sb = supabaseAnon();

  const origin = req.nextUrl.origin;
  const redirectTo = `${origin}/auth/callback`;

  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo }
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: error?.message || "No OAuth URL returned", origin, redirectTo },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
