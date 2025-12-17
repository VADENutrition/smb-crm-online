export default function Home() {
  return (
    <div className="card" style={{maxWidth:560, margin:"80px auto"}}>
      <h2 style={{marginTop:0}}>SMB CRM (Online-only)</h2>
      <div className="small">Sign in with Google (Supabase Auth). Then go to Pipeline.</div>
      <div style={{height:12}} />
      <a className="btn" href="/api/auth/login">Sign in with Google</a>
      <div style={{height:10}} />
      <div className="small">Then connect Gmail/Calendar in Settings to sync label <b>Leads</b>.</div>
    </div>
  );
}
