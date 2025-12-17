"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname();
  const btn = (href: string, label: string) => (
    <Link className="btn secondary" href={href} style={{opacity: path?.startsWith(href) ? 1 : 0.75}}>
      {label}
    </Link>
  );
  return (
    <div className="row" style={{justifyContent:"space-between", marginBottom:12}}>
      <div className="row">
        <div style={{fontWeight:900}}>SMB CRM</div>
        {btn("/pipeline","Pipeline")}
        {btn("/contacts","Contacts")}
        {btn("/settings","Settings")}
      </div>
      <a className="btn secondary" href="/api/auth/logout">Log out</a>
    </div>
  );
}
