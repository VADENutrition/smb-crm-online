"use client";

import { useEffect } from "react";
import { supabaseAnon } from "@/lib/supabaseServer";

export default function AuthCallbackPage() {
  useEffect(() => {
    (async () => {
      // Supabase can read the hash fragment client-side and set its session.
      const sb = supabaseAnon();
      const { data, error } = await sb.auth.getSession();

      // If session exists, send user to pipeline.
      if (data?.session && !error) {
        window.location.replace("/pipeline");
        return;
      }

      // If session isn’t established yet, try to parse/refresh and then redirect.
      await sb.auth.refreshSession();
      window.location.replace("/pipeline");
    })();
  }, []);

  return (
    <div className="card" style={{ maxWidth: 560, margin: "80px auto" }}>
      <h2 style={{ marginTop: 0 }}>Signing you in…</h2>
      <div className="small">Completing Google sign-in and redirecting.</div>
    </div>
  );
}
