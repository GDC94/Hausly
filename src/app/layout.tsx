import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import { getSiteUrl, SITE_NAME } from "@/shared/config/site"
import "@/styles/globals.css"

// `metadataBase` resuelve los `canonical`/OG relativos a URL absoluta (specs/SEO.md
// §2). El `template` aplica " | Hausly" a cada `title` por ruta; el `default` cubre
// las rutas sin title propio. `openGraph` global (locale es_AR + siteName) que cada
// ruta hereda; la imagen sale de `app/opengraph-image.tsx` (§3). Indexable por
// defecto — el `noindex` puntual lo pone cada ruta (listados filtrados, no
// disponibles).
const DESCRIPTION =
  "Propiedades en venta y alquiler en Argentina. Encontrá tu próxima casa o departamento con Hausly."

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  // Sin `url` global: Next hace shallow-merge de `openGraph`, así que un `url` acá
  // se le colaría como `og:url` a las rutas que no definen el suyo (/contacto,
  // /propiedades) apuntando al home. El `og:url` correcto sale del `canonical` por
  // ruta (`alternates.canonical`).
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
}

// ROOT layout: <html>/<body>, fonts y providers globales. Mínimo, sin chrome.
// El header/footer viven en app/(site)/layout.tsx (ver specs/ARCHITECTURE.md §7).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  )
}
