import { sanityFetch } from "@/shared/sanity/client"
import type { PropertiesQueryResult } from "@/shared/sanity/sanity.types"
import type { PropertyFilters } from "@/shared/types"
import { buildPropertiesQuery } from "./build-properties-query"

/**
 * Listado de propiedades disponibles, filtrado por facetas (issue #6).
 *
 * Adapter fino (specs/ARCHITECTURE.md §3): delega el ensamblado del GROQ en la
 * función pura `buildPropertiesQuery` y sólo se ocupa de ejecutar con caché por
 * tags. Publicar en Sanity dispara el webhook `/api/revalidate`, que hace
 * `revalidateTag` → la vista se regenera por contenido, no por TTL
 * (specs/ARCHITECTURE.md §4).
 *
 * Sin filtros (objeto vacío) todos los params viajan como `null` y la query
 * devuelve el listado completo — el comportamiento del issue #5.
 */
export async function getProperties(filters: PropertyFilters = {}): Promise<PropertiesQueryResult> {
  const { query, params } = buildPropertiesQuery(filters)

  // Tag `zone` además de `property`: la card renderiza `location.zone->name` y se
  // filtra por `location.zone->slug`, así que renombrar/mover una zona también
  // debe invalidar el listado (el webhook revalida el tag que matchea el `_type`).
  return sanityFetch<PropertiesQueryResult>({
    query,
    params,
    tags: ["property", "zone"],
  })
}
