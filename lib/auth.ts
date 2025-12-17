import { cookies } from "next/headers";

/**
 * Next.js 15+: cookies() is async in many server contexts.
 * Use getUserIdOrThrow() as async.
 */
export async function getUserIdOrThrow(): Promise<string> {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}
