import { NextRequest, NextResponse } from "next/server";
import { oauthClient } from "@/lib/googleClient";
import { supabaseService } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return NextResponse.json({ error: "Missing code/state" }, { status: 400 });

  const oauth = oauthClient();
  const { tokens } = await oauth.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.json({ error: "Missing tokens. Try again (prompt=consent)." }, { status: 400 });
  }

  const sb = supabaseService();
  await sb.from("google_auth").upsert({
    user_id: state,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope || null,
    token_type: tokens.token_type || null,
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    updated_at: new Date().toISOString()
  });

  return NextResponse.redirect(new URL("/settings", req.url));
}
