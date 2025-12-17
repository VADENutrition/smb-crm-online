import "./globals.css";
export const metadata = { title: "SMB CRM (Online)" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><div className="container">{children}</div></body></html>);
}
