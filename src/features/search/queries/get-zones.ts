import { defineQuery } from "next-sanity"
import { sanityFetch } from "@/shared/sanity/client"
import type { ZonesQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Zonas para poblar la faceta de zona (specs/FILTERS.md §1). Proyecta sólo lo
 * que el control necesita: el `slug` (valor del filtro → `$zones`) y el `name`
 * (label en español). Cacheada por el tag `zone`: alta/edición de una zona en
 * Sanity revalida vía webhook (specs/ARCHITECTURE.md §4).
 */
export const zonesQuery = defineQuery(`
  *[_type == "zone"] | order(name asc) {
    "slug": slug.current,
    name
  }
`)

export async function getZones(): Promise<ZonesQueryResult> {
  return sanityFetch<ZonesQueryResult>({ query: zonesQuery, tags: ["zone"] })
}
