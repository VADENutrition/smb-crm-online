import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseAnon();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${base}/api/auth/oauth-callback`;
  const { data } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  return NextResponse.redirect(data.url!);
}
