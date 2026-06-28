import { buildAgencyJsonLd } from "@/features/agency/lib/agency-json-ld"
import { getAgency } from "@/features/agency/queries/get-agency"
import { getZones } from "@/features/search/queries/get-zones"
import { getSiteUrl, SITE, SITE_NAME } from "@/shared/config/site"
import { imageUrl } from "@/shared/sanity/image"
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
      <JsonLd data={agencyLd} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
