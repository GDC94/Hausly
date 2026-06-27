/**
 * Formato de precio para el mercado AR. NO convierte monedas (Non-Goal): cada
 * monto se muestra en su propia moneda con el código adelante ("USD 180.000").
 * El separador de miles es el punto (locale es-AR). Fuente: specs/FILTERS.md §2.
 */
export type Currency = "USD" | "ARS"

const groupingFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 })

/** `formatPrice(180000, "USD")` → `"USD 180.000"`. Monto ausente → `"Consultar"`. */
export function formatPrice(amount: number | null | undefined, currency: Currency): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "Consultar"
  return `${currency} ${groupingFormatter.format(amount)}`
}
