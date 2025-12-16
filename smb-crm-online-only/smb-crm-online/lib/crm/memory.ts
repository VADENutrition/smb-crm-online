import { supabaseService } from "../supabaseServer";

export async function getMemoryText(userId: string, dealId?: string) {
  const sb = supabaseService();
  const { data: userMem } = await sb.from("memory_items").select("*").eq("user_id", userId).eq("scope","USER").order("weight", { ascending: false }).order("updated_at", { ascending: false }).limit(20);
  const { data: dealMem } = dealId
    ? await sb.from("memory_items").select("*").eq("user_id", userId).eq("scope","DEAL").eq("scope_id", dealId).order("weight", { ascending: false }).order("updated_at", { ascending: false }).limit(20)
    : { data: [] as any[] };
  const items = [...(dealMem || []), ...(userMem || [])];
  return items.map(i => `- [${i.scope}${i.scope_id ? ":"+i.scope_id : ""}] ${i.key}: ${i.content}`).join("\n");
}

export async function upsertMemory(userId: string, scope: string, scopeId: string | null, key: string, content: string, weight = 80) {
  const sb = supabaseService();
  await sb.from("memory_items").upsert({
    user_id: userId, scope, scope_id: scopeId, key, content, weight,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,scope,scope_id,key" });
}
