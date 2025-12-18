import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/", req.nextUrl.origin));

  const sb = supabaseAnon();
  const { data, error } = await sb.auth.exchangeCodeForSession(code);
  if (error || !data.session?.user?.id) return NextResponse.redirect(new URL("/", req.nextUrl.origin));

  const res = NextResponse.redirect(new URL("/pipeline", req.nextUrl.origin));
  res.cookies.set("uid", data.session.user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
