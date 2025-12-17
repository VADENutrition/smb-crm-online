import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabaseServer";
import OpenAI from "openai";
import { upsertMemory } from "@/lib/crm/memory";

export async function POST(req: NextRequest) {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { dealId } = await req.json();
  if (!dealId) return NextResponse.json({ error: "Missing dealId" }, { status: 400 });

  const sb = supabaseService();
  const { data: deal } = await sb.from("deals").select("*").eq("id", dealId).eq("user_id", uid).single();
  const { data: acts } = await sb.from("activities").select("*").eq("deal_id", dealId).eq("user_id", uid).order("occurred_at", { ascending: false }).limit(40);
  const { data: tasks } = await sb.from("tasks").select("*").eq("deal_id", dealId).eq("user_id", uid).order("created_at", { ascending: false }).limit(20);

  const input = `Summarize this deal for CRM memory.
Return:
1) 1-paragraph summary
2) Stakeholders (if any)
3) Current status
4) Objections/risks
5) Recommended next 3 actions (with exact copy to send)

DATA:
${JSON.stringify({ deal, activities: acts, tasks })}`;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.AI_MODEL || "gpt-4.1-mini";

  const resp = await client.responses.create({
    model,
    input: [
      { role: "system", content: "You write structured CRM summaries. Be specific. No fluff." },
      { role: "user", content: input }
    ]
  });

  const summary = resp.output_text;
  await upsertMemory(uid, "DEAL", dealId, "deal_summary", summary, 80);

  return NextResponse.json({ ok: true, summary });
}
