import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set("uid", "", { httpOnly: true, expires: new Date(0), sameSite: "lax", secure: true, path: "/" });
  return res;
}
