import { Nav } from "../components/Nav";
import { getUserIdOrThrow } from "../../lib/auth";
import { supabaseService } from "../../lib/supabaseServer";
import Link from "next/link";

export default async function PipelinePage() {
  const userId = await getUserIdOrThrow();
  const sb = supabaseService();

  const { data: pipelines } = await sb.from("pipelines").select("id,name").eq("user_id", userId).order("created_at");
  const pipelineId = pipelines?.[0]?.id;

  const { data: stages } = pipelineId
    ? await sb.from("stages").select("id,name,stage_order,probability").eq("pipeline_id", pipelineId).order("stage_order")
    : { data: [] as any[] };

  const { data: deals } = pipelineId
    ? await sb.from("deals").select("id,name,amount,stage_id,updated_at").eq("user_id", userId).eq("pipeline_id", pipelineId).order("updated_at", { ascending: false })
    : { data: [] as any[] };

  const byStage: Record<string, any[]> = {};
  for (const s of stages || []) byStage[s.id] = [];
  for (const d of deals || []) (byStage[d.stage_id] ||= []).push(d);

  return (
    <>
      <Nav />
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: "0 0 6px" }}>Pipeline</h2>
            <div className="small">Deals are auto-created from Gmail label sync (Leads). Seed pipeline first.</div>
          </div>
          <a className="btn secondary" href="/settings">Connect Gmail/Calendar</a>
        </div>

        <div style={{ height: 12 }} />
        <div className="board">
          {(stages || []).map((s: any) => (
            <div key={s.id} className="stage">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>{s.name}</div>
                <span className="pill">{s.probability}%</span>
              </div>
              <div style={{ height: 10 }} />
              {(byStage[s.id] || []).map((d: any) => (
                <Link key={d.id} href={`/deal/${d.id}`} className="deal">
                  <div style={{ fontWeight: 800 }}>{d.name}</div>
                  <div className="small">${d.amount || 0}</div>
                  <div className="small">Updated: {new Date(d.updated_at).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
