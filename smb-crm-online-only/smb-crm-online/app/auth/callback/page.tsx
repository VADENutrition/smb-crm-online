export default function AuthCallback() {
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Signed in</h2>
      <div className="small">Return to the app.</div>
      <div style={{height:10}} />
      <a className="btn" href="/pipeline">Go to Pipeline</a>
    </div>
  );
}
