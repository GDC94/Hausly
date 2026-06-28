import type { Currency } from "@/shared/lib/format-price"

/**
 * Bucketiza un precio en un rango grueso (specs/ANALYTICS.md §4). PostHog mide
 * conducta, no PII ni datos cruzables: nunca el monto exacto, sólo el rango
 * prefijado por moneda (ej. `"USD:100k-200k"`). Pura → testeada (TDD).
 *
 * Las bandas cubren ambas escalas del mercado AR: venta en USD (decenas/cientos
 * de miles) y ARS (millones). El límite inferior abre la banda siguiente
 * (inclusive arriba): 100000 cae en `100k-200k`, no en `50k-100k`.
 */
const THRESHOLDS = [
  50_000, 100_000, 200_000, 350_000, 500_000, 750_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000,
  50_000_000, 100_000_000,
] as const

/** `50000 → "50k"`, `1000000 → "1M"`, `750000 → "750k"`. */
function compact(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}M`
  if (n >= 1_000) return `${n / 1_000}k`
  return String(n)
}

export function toPriceBucket(amount: number | null | undefined, currency: Currency): string {
  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) return "unknown"

  const top = THRESHOLDS[THRESHOLDS.length - 1]
  if (amount >= top) return `${currency}:${compact(top)}+`

  const upperIndex = THRESHOLDS.findIndex((t) => amount < t)
  const lower = upperIndex === 0 ? 0 : THRESHOLDS[upperIndex - 1]
  const upper = THRESHOLDS[upperIndex]
  return `${currency}:${compact(lower)}-${compact(upper)}`
}
