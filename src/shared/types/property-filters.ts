/**
 * Contrato compartido de filtros de búsqueda (specs/FILTERS.md §3,
 * specs/ARCHITECTURE.md §2-§3).
 *
 * `PropertyFilters` es el objeto de filtros **ya validado** que produce
 * `features/search/lib` (parse de `searchParams`) y consume
 * `features/properties/queries` (ensamblado GROQ). Por ser el contrato entre
 * dos features vive en `shared/types`, no dentro de un feature — así properties
 * no importa de search.
 *
 * Alcance issue #6: facetas estructuradas simples (predicados `in` / `>=` /
 * `<=` / `match`). Precio + operación + moneda (el sub-filtro sobre el array
 * `operations[]`, specs/FILTERS.md §2) y `sort` llegan en el issue #7.
 *
 * Los valores de enum salen tal cual de specs/SANITY-SCHEMA.md §6 — no se
 * inventan ni se traducen (los `title` en español viven en el schema de Sanity).
 */

export const PROPERTY_TYPES = [
  "house",
  "apartment",
  "ph",
  "land",
  "commercial",
  "office",
  "warehouse",
  "garage",
  "farm",
] as const

export const CONDITIONS = ["brandNew", "used", "preConstruction"] as const

export const AMENITIES = [
  "pool",
  "grill",
  "communityRoom",
  "gym",
  "security24h",
  "laundry",
  "solarium",
  "visitorParking",
] as const

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]
export type ConditionValue = (typeof CONDITIONS)[number]
export type AmenityValue = (typeof AMENITIES)[number]

/**
 * Filtros validados. Todos los campos son opcionales: la ausencia de un campo
 * = esa faceta no filtra (la página siempre renderiza, specs/FILTERS.md §3).
 */
export type PropertyFilters = {
  /** `propertyType in $types` */
  types?: PropertyTypeValue[]
  /** slugs de zona → `location.zone->slug.current in $zones` */
  zones?: string[]
  /** mínimo → `rooms >= $rooms` */
  rooms?: number
  /** mínimo → `bathrooms >= $bathrooms` */
  bathrooms?: number
  /** m² mínimos → `coveredArea >= $areaMin` */
  areaMin?: number
  /** m² máximos → `coveredArea <= $areaMax` */
  areaMax?: number
  /** mínimo → `parkingSpaces >= $parking` */
  parking?: number
  /** `condition in $conditions` */
  conditions?: ConditionValue[]
  /** AND: la propiedad debe tener TODAS → `count(amenities[@ in $amenities]) == count($amenities)` */
  amenities?: AmenityValue[]
  /** texto libre, best-effort con wildcard de prefijo (specs/FILTERS.md §4, opción A) */
  q?: string
}
