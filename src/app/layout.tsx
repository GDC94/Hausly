import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import { getSiteUrl, SITE_NAME } from "@/shared/config/site"
import "@/styles/globals.css"

// `metadataBase` resuelve los `canonical`/OG relativos a URL absoluta (specs/SEO.md
// §2). El `template` aplica " | Hausly" a cada `title` por ruta; el `default` cubre
// las rutas sin title propio.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Inmobiliaria",
}

// ROOT layout: <html>/<body>, fonts y providers globales. Mínimo, sin chrome.
// El header/footer viven en app/(site)/layout.tsx (ver specs/ARCHITECTURE.md §7).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  )
}
