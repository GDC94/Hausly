import { AMENITIES, CONDITIONS, PROPERTY_TYPES, type PropertyFilters } from "@/shared/types"

/**
 * Forma cruda de `searchParams` tal como Next 16 los entrega ya resueltos:
 * un valor puede ser string, array (clave repetida) o `undefined`.
 */
type RawSearchParams = Record<string, string | string[] | undefined>

/**
 * `searchParams` → `PropertyFilters` validado (specs/FILTERS.md §3,
 * specs/ARCHITECTURE.md §3). Único trabajo de `search/lib`: producir el contrato
 * tipado; el ensamblado GROQ es de `properties/queries`.
 *
 * Regla maestra: **tolerante**. La URL es la única fuente de verdad, así que un
 * param desconocido, mal formado o con un valor de enum inválido se ignora —
 * nunca rompe el render. Un valor inválido dentro de una faceta multi-valor se
 * descarta sin tirar el resto.
 */
export function parseSearchParams(raw: RawSearchParams): PropertyFilters {
  const filters: PropertyFilters = {}

  const types = enumList(raw.type, PROPERTY_TYPES)
  if (types) filters.types = types

  const conditions = enumList(raw.condition, CONDITIONS)
  if (conditions) filters.conditions = conditions

  const amenities = enumList(raw.amenities, AMENITIES)
  if (amenities) filters.amenities = amenities

  const zones = slugList(raw.zone)
  if (zones) filters.zones = zones

  const rooms = minNumber(raw.rooms)
  if (rooms !== undefined) filters.rooms = rooms

  const bathrooms = minNumber(raw.bathrooms)
  if (bathrooms !== undefined) filters.bathrooms = bathrooms

  const parking = minNumber(raw.parking)
  if (parking !== undefined) filters.parking = parking

  const areaMin = minNumber(raw.areaMin)
  if (areaMin !== undefined) filters.areaMin = areaMin

  const areaMax = minNumber(raw.areaMax)
  if (areaMax !== undefined) filters.areaMax = areaMax

  const q = text(raw.q)
  if (q !== undefined) filters.q = q

  return filters
}

/**
 * Normaliza a tokens: acepta clave repetida (array) o coma-separado, trim, sin
 * vacíos y **deduplicado**. El dedupe es crítico para amenities: el predicado
 * GROQ compara `count(amenities[@ in $amenities]) == count($amenities)`, así que
 * un valor repetido en la URL (`?amenities=pool&amenities=pool`) infla
 * `count($amenities)` y haría fallar un filtro que debería ser "Pileta" a secas.
 */
function tokens(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  const parts = Array.isArray(value) ? value : value.split(",")
  const cleaned = parts.map((part) => part.trim()).filter((part) => part.length > 0)
  return [...new Set(cleaned)]
}

/** Lista validada contra un enum cerrado; `undefined` si no queda ningún valor válido. */
function enumList<T extends readonly string[]>(
  value: string | string[] | undefined,
  allowed: T,
): T[number][] | undefined {
  const valid = tokens(value).filter((token): token is T[number] =>
    (allowed as readonly string[]).includes(token),
  )
  return valid.length > 0 ? valid : undefined
}

/** Lista de slugs (zona): sin validación de enum, sólo descarta vacíos. */
function slugList(value: string | string[] | undefined): string[] | undefined {
  const slugs = tokens(value)
  return slugs.length > 0 ? slugs : undefined
}

/**
 * Número mínimo de una faceta. Tolera la codificación "4+" de la UI de pills.
 * Descarta NaN, 0 y negativos (specs/FILTERS.md §3: coerción, negativos/NaN → fuera).
 */
function minNumber(value: string | string[] | undefined): number | undefined {
  const first = Array.isArray(value) ? value[0] : value
  if (first === undefined) return undefined
  const parsed = Number(first.trim().replace(/\+$/, ""))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

/** Texto libre trimmeado; `undefined` si queda vacío. */
function text(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  const trimmed = first?.trim()
  return trimmed ? trimmed : undefined
}
