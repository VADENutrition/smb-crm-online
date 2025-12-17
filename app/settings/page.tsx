import { Nav } from "../components/Nav";

export default function SettingsPage() {
  return (
    <>
      <Nav />
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <div className="small">Connect Google for Gmail/Calendar sync. Gmail label: <b>Leads</b>.</div>
        <div style={{ height: 12 }} />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <a className="btn" href="/api/google/connect">Connect Google (Gmail/Calendar)</a>
          <form action="/api/sync/gmail" method="post"><button className="btn secondary" type="submit">Run Gmail Sync</button></form>
          <form action="/api/sync/calendar" method="post"><button className="btn secondary" type="submit">Run Calendar Sync</button></form>
        </div>
      </div>
    </>
  );
}
