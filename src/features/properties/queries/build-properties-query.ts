import { defineQuery } from "next-sanity"
import type { PropertyFilters } from "@/shared/types"

/**
 * Query de listado **con facetas** (specs/FILTERS.md §1-§4). Un único dueño
 * del GROQ: `features/properties/queries` (specs/ARCHITECTURE.md §3). El
 * `search` produce el `PropertyFilters`; acá se convierte en query + bindings.
 *
 * La query es **estática** a propósito: cada predicado va guardado por
 * `!defined($x)`, así que un param ausente (= `null`) no filtra y la query
 * tipa con `defineQuery` (TypeGen). Lo único que varía entre requests son los
 * **params** — no el texto de la query. Eso mantiene el ensamblado como una
 * función pura testeable sin prender Sanity (specs/TESTING.md) y deja el orden
 * y el slice de "Cargar más" para cuando lleguen (issues posteriores).
 *
 * El bloque base siempre fija `status == "available"`. La proyección es la forma
 * mínima de `PropertyCard` (`PropertyCardData`) — misma que el listado sin
 * filtros (issue #5), así card y query comparten una sola fuente de verdad.
 *
 * **Paginación "Cargar más" (specs/FILTERS.md §4/§5).** La query devuelve un
 * objeto `{ items, total }` en un solo fetch: `items` es el lote **acumulado**
 * `[0...$end]` ordenado newest-first; `total` es el `count()` del MISMO set sin
 * slice. La página compara `items.length < total` para decidir si mostrar el
 * botón, sin un segundo round-trip. Es slice acumulado `[0...$end]` (no
 * `[$offset...$end]`): cada lote re-trae lo anterior + el nuevo, así el listado
 * funciona sin JS (la URL crawleable `?offset=` acumula sola) y el footer queda
 * siempre alcanzable. El predicado de filtrado se repite en `items` y en `total`
 * — son el mismo set, deben quedar sincronizados.
 *
 * **Sub-filtro `operations[]` (la parte crítica, specs/FILTERS.md §2).** Una
 * propiedad puede tener venta-USD Y alquiler-ARS simultáneos y NO hay conversión
 * (Non-Goal). Por eso operación + moneda + precio se evalúan DENTRO de un único
 * `count(operations[ … ]) > 0`: los cuatro predicados corren sobre el MISMO
 * elemento del array. Así "venta hasta USD 200k" jamás matchea una propiedad
 * cuya venta-USD es carísima sólo porque tiene aparte un alquiler-ARS barato.
 */
export const propertiesQuery = defineQuery(`
  {
    "items": *[_type == "property"
      && status == "available"
      && (!defined($types) || propertyType in $types)
      && (!defined($zones) || location.zone->slug.current in $zones)
      && (!defined($rooms) || rooms >= $rooms)
      && (!defined($bathrooms) || bathrooms >= $bathrooms)
      && (!defined($areaMin) || coveredArea >= $areaMin)
      && (!defined($areaMax) || coveredArea <= $areaMax)
      && (!defined($parking) || parkingSpaces >= $parking)
      && (!defined($conditions) || condition in $conditions)
      && (!defined($amenities) || count(amenities[@ in $amenities]) == count($amenities))
      && (!defined($q) || title match $q || code match $q || (location.showAddress == true && location.address match $q))
      && count(operations[
        (!defined($operation) || type == $operation) &&
        (!defined($currency) || price.currency == $currency) &&
        (!defined($priceMin) || price.amount >= $priceMin) &&
        (!defined($priceMax) || price.amount <= $priceMax)
      ]) > 0
    ] | order(_createdAt desc) [0...$end] {
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
    },
    "total": count(*[_type == "property"
      && status == "available"
      && (!defined($types) || propertyType in $types)
      && (!defined($zones) || location.zone->slug.current in $zones)
      && (!defined($rooms) || rooms >= $rooms)
      && (!defined($bathrooms) || bathrooms >= $bathrooms)
      && (!defined($areaMin) || coveredArea >= $areaMin)
      && (!defined($areaMax) || coveredArea <= $areaMax)
      && (!defined($parking) || parkingSpaces >= $parking)
      && (!defined($conditions) || condition in $conditions)
      && (!defined($amenities) || count(amenities[@ in $amenities]) == count($amenities))
      && (!defined($q) || title match $q || code match $q || (location.showAddress == true && location.address match $q))
      && count(operations[
        (!defined($operation) || type == $operation) &&
        (!defined($currency) || price.currency == $currency) &&
        (!defined($priceMin) || price.amount >= $priceMin) &&
        (!defined($priceMax) || price.amount <= $priceMax)
      ]) > 0
    ])
  }
`)

/**
 * Bindings de la query. Cada faceta ausente viaja como `null`: GROQ evalúa
 * `defined(null) == false`, neutralizando su predicado. Pasar **todas** las
 * claves siempre es obligatorio — referenciar un `$param` no provisto rompe la
 * query.
 */
export type PropertiesQueryParams = {
  types: string[] | null
  zones: string[] | null
  rooms: number | null
  bathrooms: number | null
  areaMin: number | null
  areaMax: number | null
  parking: number | null
  conditions: string[] | null
  amenities: string[] | null
  q: string | null
  operation: string | null
  currency: string | null
  priceMin: number | null
  priceMax: number | null
  /** Límite superior del slice acumulado `[0...$end]` ("Cargar más"). */
  end: number
}

/**
 * Ensamblado **puro**: `PropertyFilters → { query, params }`, sin tocar Sanity.
 * Es el *test surface* del GROQ (specs/ARCHITECTURE.md §3). El adapter
 * `getProperties` es quien ejecuta con `sanityFetch`.
 *
 * `q` recibe un **wildcard de prefijo** (`term*`) — `match` tokeniza por palabra,
 * así "pal" encuentra "Palermo" (specs/FILTERS.md §4, opción A). El folding de
 * acentos es una limitación conocida y aceptada del MVP.
 *
 * **Privacidad:** el match sobre `location.address` va gateado por
 * `location.showAddress == true`. Si la dirección no es pública (privacidad,
 * specs/SANITY-SCHEMA.md §4) NO puede usarse como oráculo: buscar un token de
 * dirección no debe revelar por descarte una propiedad de dirección oculta.
 */
export function buildPropertiesQuery(
  filters: PropertyFilters,
  end: number,
): {
  query: typeof propertiesQuery
  params: PropertiesQueryParams
} {
  return {
    query: propertiesQuery,
    params: {
      types: filters.types ?? null,
      zones: filters.zones ?? null,
      rooms: filters.rooms ?? null,
      bathrooms: filters.bathrooms ?? null,
      areaMin: filters.areaMin ?? null,
      areaMax: filters.areaMax ?? null,
      parking: filters.parking ?? null,
      conditions: filters.conditions ?? null,
      amenities: filters.amenities ?? null,
      q: filters.q ? `${filters.q}*` : null,
      operation: filters.operation ?? null,
      currency: filters.currency ?? null,
      priceMin: filters.priceMin ?? null,
      priceMax: filters.priceMax ?? null,
      end,
    },
  }
}
