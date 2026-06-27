import { formatPrice } from "@/shared/lib/format-price"
import type { PropertyCardData } from "../types"
import { OPERATION_LABELS } from "./labels"

/**
 * Línea de precio de la card. Precio DUAL: una propiedad puede tener varias
 * operaciones (venta en USD Y alquiler en ARS) y NO hay conversión entre monedas
 * (Non-Goal, specs/FILTERS.md §2). Por eso cada operación se muestra en su propia
 * moneda; con 2+ operaciones se prefija el tipo para que no quede ambiguo.
 */
export function buildPriceLine(operations: PropertyCardData["operations"]): string {
  if (!operations || operations.length === 0) return "Consultar precio"
  const labeled = operations.length > 1
  return operations
    .map((op) => {
      const price = formatPrice(op.price?.amount, op.price?.currency ?? "USD")
      return labeled && op.type ? `${OPERATION_LABELS[op.type]} ${price}` : price
    })
    .join(" · ")
}
