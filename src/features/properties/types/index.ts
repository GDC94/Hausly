import type { PropertiesQueryResult, PropertyQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Proyección mínima que consume `PropertyCard` (specs/LAYOUT.md §4). Se deriva
 * del resultado tipado de la query — no del `property` completo — así la card y
 * la query comparten una sola fuente de verdad (TypeGen).
 */
export type PropertyCardData = PropertiesQueryResult["items"][number]

/**
 * Forma COMPLETA del detalle (issue #9, specs/LAYOUT.md §7). `PropertyQueryResult`
 * es `… | null` (slug inexistente) — `PropertyDetail` es la variante ya
 * garantizada no-nula que consumen los componentes del detalle, tras el
 * `notFound()` de la página.
 */
export type PropertyDetail = NonNullable<PropertyQueryResult>
