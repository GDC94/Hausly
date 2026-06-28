/**
 * Lee el `offset` de paginación de `searchParams` (specs/FILTERS.md §4/§5). Es el
 * estado del listado **"Cargar más"**: cada lote es una URL crawleable `?offset=N`
 * y el `offset` cuenta cuántas propiedades ya quedaron arriba.
 *
 * Vive **aparte** de `parseSearchParams` a propósito: el `offset` NO es una faceta
 * de `PropertyFilters` (no filtra el dominio, pagina el resultado). Mantenerlo
 * separado evita ensuciar el contrato de filtros con estado de presentación.
 *
 * Tolerante igual que el resto del parse (FILTERS §3): ausente, NaN, negativo,
 * cero o decimal → `0` (primer lote). Nunca rompe el render.
 */
export function parseOffset(value: string | string[] | undefined): number {
  const first = Array.isArray(value) ? value[0] : value
  if (first === undefined) return 0
  const parsed = Number(first.trim())
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return Math.floor(parsed)
}
