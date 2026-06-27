import { defineQuery } from "next-sanity"
import { sanityFetch } from "@/shared/sanity/client"
import type { PropertiesQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Listado de propiedades disponibles (sin filtros — issue #5).
 *
 * Proyecta a la forma mínima que consume `PropertyCard` (`PropertyCardData`),
 * NO el `property` completo: la card sólo necesita imagen, precio, specs y zona
 * (ver specs/LAYOUT.md §4, specs/ARCHITECTURE.md §6).
 *
 * El bloque base siempre fija `status == "available"` (specs/FILTERS.md §4).
 * El orden por defecto es `newest` → `_createdAt desc`. El catálogo de filtros
 * y el ensamblado dinámico (`buildPropertiesQuery`) llegan en los issues #6/#7;
 * acá la query es estática y tiene un único dueño: properties.
 */
export const propertiesQuery = defineQuery(`
  *[_type == "property" && status == "available"] | order(_createdAt desc) {
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
 * Adapter fino: ejecuta la query con caché por tags. Publicar en Sanity dispara
 * el webhook `/api/revalidate`, que hace `revalidateTag("property")` → la vista
 * se regenera por contenido, no por TTL (specs/ARCHITECTURE.md §4).
 */
export async function getProperties() {
  // Tag `zone` además de `property`: la card renderiza `location.zone->name`, así
  // que renombrar una zona también debe invalidar el listado (el webhook revalida
  // el tag que matchea el `_type` del documento publicado).
  return sanityFetch<PropertiesQueryResult>({
    query: propertiesQuery,
    tags: ["property", "zone"],
  })
}
