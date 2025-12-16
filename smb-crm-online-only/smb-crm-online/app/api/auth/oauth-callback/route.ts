import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "../../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/", req.url));

  const sb = supabaseAnon();
  const { data, error } = await sb.auth.exchangeCodeForSession(code);
  if (error || !data.session?.user?.id) return NextResponse.redirect(new URL("/", req.url));

  const res = NextResponse.redirect(new URL("/pipeline", req.url));
  // For local dev, set SECURE_COOKIES=false in env and adjust if needed.
  res.cookies.set("uid", data.session.user.id, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return res;
}
