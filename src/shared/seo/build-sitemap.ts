import type { MetadataRoute } from "next"

/**
 * Construye el sitemap (specs/SEO.md §5) como función **pura**:
 * `(siteUrl, properties, zones) → MetadataRoute.Sitemap`. La ruta `app/sitemap.ts`
 * sólo hace el fetch (propiedades indexables + zonas) y delega el armado acá, para
 * unit-testear el shape sin Sanity ni Next.
 *
 * Indexables únicamente: el caller filtra `status == "available"` en GROQ (no
 * rankear lo vendido, §2). Las landings por zona son URLs reales de alto valor SEO
 * (§7) → van al sitemap; el filtro libre por `searchParams` NO (es `noindex`).
 */

type SitemapInput = {
  /** URL absoluta del sitio (sin barra final). */
  siteUrl: string
  properties: Array<{ slug?: string | null; _updatedAt?: string | null }>
  zones: Array<{ slug?: string | null }>
}

export function buildSitemap({ siteUrl, properties, zones }: SitemapInput): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/propiedades`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contacto`, changeFrequency: "yearly", priority: 0.4 },
  ]

  const propertyRoutes: MetadataRoute.Sitemap = properties
    .filter((property): property is { slug: string; _updatedAt?: string | null } =>
      Boolean(property.slug),
    )
    .map((property) => ({
      url: `${siteUrl}/propiedades/${property.slug}`,
      lastModified: property._updatedAt ?? undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }))

  const zoneRoutes: MetadataRoute.Sitemap = zones
    .filter((zone): zone is { slug: string } => Boolean(zone.slug))
    .map((zone) => ({
      url: `${siteUrl}/propiedades/zona/${zone.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }))

  return [...staticRoutes, ...propertyRoutes, ...zoneRoutes]
}
