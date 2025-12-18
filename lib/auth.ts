import { supabaseService } from "@/lib/supabaseServer";

/**
 * Server-side auth:
 * Read the currently signed-in Supabase user using the service role client.
 * This avoids relying on a custom "uid" cookie.
 */
export async function getUserIdOrThrow(): Promise<string> {
  const sb = supabaseService();

  // Supabase will read its auth cookies from the request automatically in Next.js runtime
  const { data, error } = await sb.auth.getUser();

  const userId = data?.user?.id;
  if (error || !userId) throw new Error("Not authenticated");

  return userId;
}
