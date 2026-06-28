import type { MetadataRoute } from "next"
import { getPropertiesForSitemap } from "@/features/properties"
import { getZones } from "@/features/search"
import { getSiteUrl } from "@/shared/config/site"
import { buildSitemap } from "@/shared/seo/build-sitemap"

// Sitemap nativo de Next (specs/SEO.md §5): rutas estáticas + propiedades
// indexables + landings por zona. `app/` es sólo routing — el fetch vive acá y el
// armado del shape en `buildSitemap` (puro, testeado). Los fetches están cacheados
// por tags (`property`/`zone`) → el sitemap se regenera cuando el contenido cambia
// vía webhook, no por TTL (specs/ARCHITECTURE.md §4).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, zones] = await Promise.all([getPropertiesForSitemap(), getZones()])
  return buildSitemap({ siteUrl: getSiteUrl(), properties, zones })
}
