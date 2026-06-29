import { Suspense } from "react"
import { buildAgencyJsonLd, getAgency } from "@/features/agency"
import { getZones } from "@/features/search"
import { PageviewTracker, WhatsAppTelemetry } from "@/shared/analytics"
import { getSiteUrl, SITE, SITE_NAME } from "@/shared/config/site"
import { imageUrl } from "@/shared/sanity/image"
import { ConsentBanner } from "@/shared/ui/consent-banner"
import { JsonLd } from "@/shared/ui/json-ld"
import { SiteFooter } from "@/shared/ui/site-footer"
import { SiteHeader } from "@/shared/ui/site-header"

// Shell del sitio público: chrome (header + footer) presente en TODAS las páginas
// públicas. El route group (site) no afecta la URL (ver specs/ARCHITECTURE.md §7).
// El Studio queda FUERA de este grupo → hereda solo el root pelado, sin chrome.
//
// Inyecta el JSON-LD `RealEstateAgent` global (specs/SEO.md §4.2): vive acá para
// estar en toda página pública. Datos del singleton `agency` con fallback a
// site.ts (NAP estable mientras el editor no lo cargue en Sanity).
export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [agency, zones] = await Promise.all([getAgency(), getZones()])

  const agencyLd = buildAgencyJsonLd(agency, {
    siteUrl: getSiteUrl(),
    zones,
    fallback: {
      name: SITE_NAME,
      phone: SITE.contact.phone,
      email: SITE.contact.email,
      address: SITE.contact.address,
      socials: SITE.socials,
    },
    imageUrl: (source) => imageUrl(source, { width: 512 }),
  })

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip link (WCAG 2.4.1 "Bypass Blocks", specs/SEO.md §6): primer elemento
          focuseable → el usuario de teclado salta el chrome repetido y va al
          contenido. Invisible salvo al recibir foco (`focus:not-sr-only`). */}
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Saltar al contenido
      </a>
      <JsonLd data={agencyLd} />
      {/* `useSearchParams` del tracker exige Suspense o toda la página cae a CSR. */}
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <WhatsAppTelemetry />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <ConsentBanner />
    </div>
  )
}
