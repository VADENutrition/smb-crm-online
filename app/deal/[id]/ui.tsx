"use client";
import { useState } from "react";

export default function AskAiPanel({ dealId }: { dealId: string }) {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function call(path: string, body: any) {
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 900, marginBottom: 6 }}>Ask AI</div>
      <div className="small">Uses your CRM memory + this deal’s context.</div>
      <div style={{ height: 10 }} />

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button className="btn secondary" onClick={async () => {
          setLoading(true); setOut("");
          try {
            const r = await call("/api/ai/ingest/deal", { dealId });
            setOut(r.summary);
          } catch (e: any) {
            setOut(String(e.message || e));
          } finally {
            setLoading(false);
          }
        }}>Summarize to memory</button>

        <button className="btn secondary" onClick={() => setText("Draft a reply to the latest email. Keep it confident, concise, and ask for a meeting. Give 2 subject lines.")}>
          Draft reply
        </button>

        <button className="btn secondary" onClick={() => setText("What are the top 5 next actions to advance this deal, ordered by impact? Include exact language I should send.")}>
          Next steps
        </button>
      </div>

      <div style={{ height: 10 }} />
      <textarea className="input" style={{ minHeight: 120 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask something about this deal…" />
      <div style={{ height: 10 }} />

      <button className="btn" disabled={loading} onClick={async () => {
        if (!text.trim()) return;
        setLoading(true); setOut("");
        try {
          const r = await call("/api/ai/chat", { dealId, message: text });
          setOut(r.text);
        } catch (e: any) {
          setOut(String(e.message || e));
        } finally {
          setLoading(false);
        }
      }}>{loading ? "Working…" : "Ask"}</button>

      <div style={{ height: 10 }} />
      <div className="card" style={{ padding: 10, background: "#0b0f14" }}>
        <div className="small" style={{ whiteSpace: "pre-wrap" }}>{out || "AI output will appear here."}</div>
      </div>
    </div>
  );
}
