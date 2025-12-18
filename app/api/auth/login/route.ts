import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseAnon();
const origin = req.nextUrl.origin;
const redirectTo = `${origin}/auth/callback`;
  const { data } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  return NextResponse.redirect(data.url!);
}
