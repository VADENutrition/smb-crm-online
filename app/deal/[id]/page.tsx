import { Nav } from "../../components/Nav";
import { getUserIdOrThrow } from "../../../lib/auth";
import { supabaseService } from "../../../lib/supabaseServer";
import AskAiPanel from "./ui";

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdOrThrow();
  const { id: dealId } = await params;
  const sb = supabaseService();

  const { data: deal } = await sb
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", userId)
    .single();

  const { data: activities } = await sb
    .from("activities")
    .select("*")
    .eq("deal_id", dealId)
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .limit(40);

  const { data: tasks } = await sb
    .from("tasks")
    .select("*")
    .eq("deal_id", dealId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!deal) return (<><Nav /><div className="card">Deal not found.</div></>);

  return (
    <>
      <Nav />
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{deal.name}</div>
            <div className="small">Deal ID: {deal.id}</div>
          </div>
          <a className="btn secondary" href="/pipeline">Back</a>
        </div>

        <hr />

        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="col" style={{ flex: 1 }}>
            <div style={{ fontWeight: 900 }}>Timeline</div>
            <div className="small">Newest first</div>
            <div style={{ height: 8 }} />

            <div className="col">
              {(activities || []).map((a: any) => (
                <div key={a.id} className="card" style={{ padding: 10 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900 }}>{a.type}: {a.subject || ""}</div>
                    <div className="small">{new Date(a.occurred_at).toLocaleString()}</div>
                  </div>
                  {a.body ? <div className="small" style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{a.body}</div> : null}
                </div>
              ))}
            </div>

            <hr />

            <div style={{ fontWeight: 900 }}>Tasks</div>
            <div className="col">
              {(tasks || []).map((t: any) => (
                <div key={t.id} className="card" style={{ padding: 10 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900, textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</div>
                    <div className="small">{t.completed ? "Done" : "Open"}</div>
                  </div>
                  {t.due_date ? <div className="small">Due: {new Date(t.due_date).toLocaleString()}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: 420 }}>
            <AskAiPanel dealId={dealId} />
          </div>
        </div>
      </div>
    </>
  );
}
