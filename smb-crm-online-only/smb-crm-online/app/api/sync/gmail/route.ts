import { NextRequest, NextResponse } from "next/server";
import { syncGmailLabelForUser } from "../../../../lib/crm/upsertFromGmail";
import { cookies } from "next/headers";

function okCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("x-cron-secret") === secret;
}

export async function POST(req: NextRequest) {
  if (!okCron(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const count = await syncGmailLabelForUser(uid);
    return NextResponse.json({ ok: true, synced: count });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 400 });
  }
}
