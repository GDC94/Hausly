// Shell del sitio público: chrome (header + footer) presente en TODAS las páginas
// públicas. El route group (site) no afecta la URL (ver specs/ARCHITECTURE.md §7).
// Placeholder mínimo: header/footer definitivos llegan con su issue de chrome.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4">
          <span className="text-subheading">Hausly</span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-border border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-caption text-muted-foreground">
          © Hausly
        </div>
      </footer>
    </div>
  )
}
