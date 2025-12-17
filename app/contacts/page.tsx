import { Nav } from "../components/Nav";
import { getUserIdOrThrow } from "../../lib/auth";
import { supabaseService } from "../../lib/supabaseServer";

export default async function ContactsPage() {
  const userId = await getUserIdOrThrow();
  const sb = supabaseService();
  const { data: contacts } = await sb.from("contacts").select("id,first_name,last_name,email,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);

  return (
    <>
      <Nav />
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Contacts</h2>
        <div className="small">Auto-created from Gmail label sync (Leads).</div>
        <hr />
        <div className="col">
          {(contacts || []).map((c: any) => (
            <div key={c.id} className="card" style={{ padding: 10 }}>
              <div style={{ fontWeight: 900 }}>{c.first_name} {c.last_name || ""}</div>
              <div className="small">{c.email || "—"}</div>
              <div className="small">Created: {new Date(c.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
