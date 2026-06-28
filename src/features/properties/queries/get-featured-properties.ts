import { defineQuery } from "next-sanity"
import { sanityFetch } from "@/shared/sanity/client"
import type { FeaturedPropertiesQueryResult } from "@/shared/sanity/sanity.types"

/** Cuántas destacadas muestra la home: 2 filas del grid de 3 col (specs/LAYOUT.md §3,§9). */
export const FEATURED_LIMIT = 6

/**
 * Propiedades **destacadas** para la home (issue #12, specs/LAYOUT.md §3): pin
 * editorial vía el flag `featured` del schema. Proyección IDÉNTICA a la del listado
 * (`PropertyCardData`) para reusar `PropertyCard` sin variantes — una sola forma de
 * card en listado/zona/destacadas (specs/ARCHITECTURE.md §3). Sólo `available` y
 * newest-first, acotada a `FEATURED_LIMIT`.
 */
export const featuredPropertiesQuery = defineQuery(`
  *[_type == "property" && status == "available" && featured == true]
    | order(_createdAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    rooms,
    bathrooms,
    coveredArea,
    "zone": location.zone->name,
    operations[]{ type, price },
    mainImage {
      ...,
      "lqip": asset->metadata.lqip
    }
  }
`)

/**
 * Adapter cacheado por tags (`['property','zone']`): publicar/destacar en Sanity
 * revalida vía webhook `/api/revalidate` (specs/ARCHITECTURE.md §4), no por TTL.
 */
export async function getFeaturedProperties(): Promise<FeaturedPropertiesQueryResult> {
  return sanityFetch<FeaturedPropertiesQueryResult>({
    query: featuredPropertiesQuery,
    tags: ["property", "zone"],
  })
}
