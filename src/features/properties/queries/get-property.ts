import { defineQuery } from "next-sanity"
import { sanityFetch } from "@/shared/sanity/client"
import type { PropertyQueryResult, PropertySlugsQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Detalle de una propiedad por slug (issue #9, specs/LAYOUT.md §7). Trae la forma
 * COMPLETA — no la proyección mínima de card (issue #5): galería, descripción
 * (Portable Text crudo para render + `pt::text` plano para metadata/JSON-LD),
 * location con geopoint, características y amenities.
 *
 * `descriptionPlain` = `pt::text(description)` resuelto en GROQ → la meta
 * description sale de texto plano recortado, sin parsear Portable Text en el
 * cliente (specs/SEO.md §2).
 */
export const propertyQuery = defineQuery(`
  *[_type == "property" && slug.current == $slug][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    code,
    "slug": slug.current,
    propertyType,
    status,
    operations[]{ type, price },
    description,
    "descriptionPlain": pt::text(description),
    location {
      address,
      showAddress,
      geopoint,
      "zone": zone->{ name, "slug": slug.current }
    },
    bedrooms,
    bathrooms,
    rooms,
    coveredArea,
    totalArea,
    parkingSpaces,
    age,
    condition,
    maintenanceFee,
    amenities,
    mainImage {
      ...,
      "lqip": asset->metadata.lqip
    },
    gallery[] {
      ...,
      "lqip": asset->metadata.lqip
    }
  }
`)

/**
 * Slugs de todas las propiedades para `generateStaticParams` (specs/ARCHITECTURE.md
 * §4): con <20 propiedades de lanzamiento se **pre-generan todas** en el build.
 */
export const propertySlugsQuery = defineQuery(`
  *[_type == "property" && defined(slug.current)]{ "slug": slug.current }
`)

/**
 * Adapter de detalle. Cacheado por tags (`['property','zone']`): publicar revalida
 * vía webhook `/api/revalidate` (specs/ARCHITECTURE.md §4), no por TTL. Tag `zone`
 * porque la card de contacto / breadcrumb usan `location.zone->name`.
 *
 * Devuelve `null` si el slug no existe → la página llama `notFound()`.
 */
export async function getProperty(slug: string): Promise<PropertyQueryResult> {
  return sanityFetch<PropertyQueryResult>({
    query: propertyQuery,
    params: { slug },
    tags: ["property", "zone"],
  })
}

/** Todos los slugs publicados, para `generateStaticParams`. */
export async function getPropertySlugs(): Promise<PropertySlugsQueryResult> {
  return sanityFetch<PropertySlugsQueryResult>({
    query: propertySlugsQuery,
    tags: ["property"],
  })
}
