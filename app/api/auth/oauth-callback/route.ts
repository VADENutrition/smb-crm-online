import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const sb = supabaseAnon();

  // Always use the current origin so we never accidentally bounce to another app domain.
  const origin = req.nextUrl.origin;
  const redirectTo = `${origin}/api/auth/oauth-callback`;

  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo }
  });

  if (error || !data?.url) {
    // Show the error in the browser instead of “click does nothing”
    return NextResponse.json(
      { error: error?.message || "No OAuth URL returned", origin, redirectTo },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
