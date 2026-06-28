import { formatPrice } from "@/shared/lib/format-price"
import { CONDITION_LABELS, PROPERTY_TYPE_LABELS } from "@/shared/lib/labels"
import type { PropertyDetail } from "../types"

/**
 * Características de la propiedad (specs/LAYOUT.md §7): grilla de datos duros.
 * Omite los campos ausentes — nunca inventa ni muestra "—". Cada fila es un par
 * etiqueta/valor; los datos salen tal cual del schema (un concepto = una fuente).
 */
export function PropertyFeatures({ property }: { property: PropertyDetail }) {
  const items = buildFeatureList(property)
  if (items.length === 0) return null

  return (
    <section aria-labelledby="features-heading">
      <h2 id="features-heading" className="text-subheading text-foreground">
        Características
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-caption text-muted-foreground">{item.label}</dt>
            <dd className="text-body font-medium text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function buildFeatureList(p: PropertyDetail): Array<{ label: string; value: string }> {
  const items: Array<{ label: string; value: string }> = []
  const push = (label: string, value: string | null) => {
    if (value) items.push({ label, value })
  }

  push("Tipo", p.propertyType ? PROPERTY_TYPE_LABELS[p.propertyType] : null)
  push("Ambientes", num(p.rooms))
  push("Dormitorios", num(p.bedrooms))
  push("Baños", num(p.bathrooms))
  push("Cocheras", num(p.parkingSpaces))
  push("Sup. cubierta", area(p.coveredArea))
  push("Sup. total", area(p.totalArea))
  push("Antigüedad", p.age != null ? (p.age === 0 ? "A estrenar" : `${p.age} años`) : null)
  push("Estado", p.condition ? CONDITION_LABELS[p.condition] : null)
  push(
    "Expensas",
    p.maintenanceFee?.amount
      ? formatPrice(p.maintenanceFee.amount, p.maintenanceFee.currency ?? "ARS")
      : null,
  )
  push("Código", p.code)
  return items
}

const num = (n: number | null | undefined): string | null => (n != null ? String(n) : null)
const area = (n: number | null | undefined): string | null => (n != null ? `${n} m²` : null)
