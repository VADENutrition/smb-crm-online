import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("uid", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return res;
}
