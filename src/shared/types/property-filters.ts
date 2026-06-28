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
 * Facetas estructuradas simples — predicados `in` / `>=` / `<=` / `match`
 * (issue #6) — más el **embudo precio/operación/moneda** (issue #7): el
 * sub-filtro sobre el array `operations[]` que evalúa los tres sobre el MISMO
 * elemento (specs/FILTERS.md §2).
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

export const OPERATION_TYPES = ["sale", "rent", "temporaryRent"] as const

export const CURRENCIES = ["USD", "ARS"] as const

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]
export type ConditionValue = (typeof CONDITIONS)[number]
export type AmenityValue = (typeof AMENITIES)[number]
export type OperationTypeValue = (typeof OPERATION_TYPES)[number]
export type CurrencyValue = (typeof CURRENCIES)[number]

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

  // --- Embudo precio/operación/moneda (specs/FILTERS.md §2) ---
  // Los tres se evalúan sobre el MISMO elemento de `operations[]`: nunca se
  // cruza una venta-USD con un alquiler-ARS. `priceMin/Max` SIN `currency` no
  // tienen sentido (no hay conversión, Non-Goal) y se descartan en el parse.
  /** `operations[].type == $operation` (dentro del sub-filtro) */
  operation?: OperationTypeValue
  /** `operations[].price.currency == $currency` (filtro explícito, no derivado) */
  currency?: CurrencyValue
  /** `operations[].price.amount >= $priceMin` */
  priceMin?: number
  /** `operations[].price.amount <= $priceMax` */
  priceMax?: number
}
