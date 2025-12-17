import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { getMemoryText } from "@/lib/crm/memory";
import { supabaseService } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { dealId, message } = await req.json();
  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });

  const sb = supabaseService();
  const memory = await getMemoryText(uid, dealId);

  let dealCtx = "";
  if (dealId) {
    const { data: deal } = await sb.from("deals").select("id,name,amount,probability,updated_at").eq("id", dealId).eq("user_id", uid).single();
    const { data: acts } = await sb.from("activities").select("type,subject,body,occurred_at").eq("deal_id", dealId).eq("user_id", uid).order("occurred_at", { ascending: false }).limit(12);
    dealCtx = `DEAL:\n${JSON.stringify(deal)}\n\nRECENT_ACTIVITY:\n${JSON.stringify(acts)}`;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.AI_MODEL || "gpt-4.1-mini";

  const system = "You are the CRM copilot for a single-user SMB CRM. Provide actionable next steps, drafts, and risk flags. Never claim you performed actions you didn't do.";
  const user = `CRM MEMORY:\n${memory}\n\n${dealCtx}\n\nUSER REQUEST:\n${message}`;

  const resp = await client.responses.create({
    model,
    input: [{ role: "system", content: system }, { role: "user", content: user }]
  });

  return NextResponse.json({ ok: true, text: resp.output_text });
}
