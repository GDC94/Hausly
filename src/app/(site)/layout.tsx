import { SiteFooter } from "@/shared/ui/site-footer"
import { SiteHeader } from "@/shared/ui/site-header"

// Shell del sitio público: chrome (header + footer) presente en TODAS las páginas
// públicas. El route group (site) no afecta la URL (ver specs/ARCHITECTURE.md §7).
// El Studio queda FUERA de este grupo → hereda solo el root pelado, sin chrome.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
