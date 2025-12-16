import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { oauthClient } from "../../../../lib/googleClient";

export async function GET() {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const oauth = oauthClient();
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly"
  ];
  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: uid
  });

  return NextResponse.redirect(url);
}
