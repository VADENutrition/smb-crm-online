import { google } from "googleapis";
import { supabaseService } from "./supabaseServer";

export function oauthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function getAuthedGoogle(userId: string) {
  const sb = supabaseService();
  const { data, error } = await sb.from("google_auth").select("*").eq("user_id", userId).single();
  if (error || !data) throw new Error("Google not connected");

  const oauth = oauthClient();
  oauth.setCredentials({ access_token: data.access_token, refresh_token: data.refresh_token });

  oauth.on("tokens", async (tokens) => {
    const update: any = {};
    if (tokens.access_token) update.access_token = tokens.access_token;
    if (tokens.expiry_date) update.expiry_date = new Date(tokens.expiry_date).toISOString();
    if (Object.keys(update).length) {
      await sb.from("google_auth").update({ ...update, updated_at: new Date().toISOString() }).eq("user_id", userId);
    }
  });

  return oauth;
}
