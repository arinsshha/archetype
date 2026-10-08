import "./globals.css";
export const metadata = { title: "Archetype Test", description: "Find your archetype" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&display=swap" /></head>
      <body>
        <header className="brand">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 12h14M8 16h16M8 20h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          <span>Archetype Lab</span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
