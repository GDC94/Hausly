import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { isBlocked } from "@/shared/styleguide"

// `noindex` (capa 2 del blindaje, specs/STYLEGUIDE.md §2): la vitrina nunca entra a
// buscadores aunque se filtre una URL de preview. El robots.txt (capa 3) la refuerza.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
}

/**
 * Layout del laboratorio `/styleguide` (specs/STYLEGUIDE.md §2). Vive FUERA del route
 * group `(site)` → hereda sólo el root pelado (sin Header/Footer del sitio). Aporta el
 * único "estilo propio" del lab: el chrome mínimo de catálogo (link al índice), con tokens.
 *
 * **Capa 1 del blindaje:** 404 en producción. Corre en build Y en request → en el build
 * de prod la ruta se vuelve 404 real; en preview/dev rinde. El corte gemelo vive en
 * `[section]/generateStaticParams` (evita el fetch en build). Se evalúa `VERCEL_ENV`.
 */
export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  if (isBlocked(process.env.VERCEL_ENV)) notFound()

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between border-border border-b pb-4">
        <Link href="/styleguide" className="text-body font-semibold text-foreground">
          Styleguide
        </Link>
        <span className="text-caption text-muted-foreground">Banco de revisión · interno</span>
      </header>
      <main>{children}</main>
    </div>
  )
}
