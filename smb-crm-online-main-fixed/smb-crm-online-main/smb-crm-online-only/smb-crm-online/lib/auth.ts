import { cookies } from "next/headers";

export function getUserIdOrThrow(): string {
  const uid = cookies().get("uid")?.value;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}
