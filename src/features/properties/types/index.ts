import type { PropertiesQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Proyección mínima que consume `PropertyCard` (specs/LAYOUT.md §4). Se deriva
 * del resultado tipado de la query — no del `property` completo — así la card y
 * la query comparten una sola fuente de verdad (TypeGen).
 */
export type PropertyCardData = PropertiesQueryResult[number]
