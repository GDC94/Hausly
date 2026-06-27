import Link from "next/link"
import { OPERATION_LABELS } from "@/shared/lib/labels"
import { buildPriceLine } from "../lib/build-price-line"
import type { PropertyCardData } from "../types"
import { PropertyImage } from "./property-image"

const CARD_IMAGE_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"

/**
 * Átomo reusado en listado, zona, destacadas y "cercanas" — una sola card, sin
 * variantes (specs/LAYOUT.md §4). Toda la superficie es un link al detalle.
 * Consume `PropertyCardData` (proyección mínima), nunca el `property` completo.
 */
export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertyCardData
  priority?: boolean
}) {
  const { slug, title, zone, mainImage } = property
  const href = slug ? `/propiedades/${slug}` : "/propiedades"
  const specs = buildSpecs(property)
  const pill = primaryOperationLabel(property)
  const priceLine = buildPriceLine(property.operations)

  return (
    <article>
      <Link
        href={href}
        className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative">
          <PropertyImage
            image={mainImage}
            title={title ?? "Propiedad"}
            sizes={CARD_IMAGE_SIZES}
            priority={priority}
          />
          {pill ? (
            <span className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-caption font-medium text-foreground shadow-sm">
              {pill}
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-subheading text-foreground">{title ?? "Propiedad"}</h3>
          {zone ? <p className="text-body-sm text-muted-foreground">{zone}</p> : null}
          {specs ? <p className="text-body-sm text-muted-foreground">{specs}</p> : null}
          <p className="text-body font-semibold text-foreground">{priceLine}</p>
        </div>
      </Link>
    </article>
  )
}

/** "3 amb · 2 baños · 120 m²" — omite los campos ausentes (specs/LAYOUT.md §4). */
function buildSpecs({ rooms, bathrooms, coveredArea }: PropertyCardData): string {
  const parts: string[] = []
  if (rooms) parts.push(`${rooms} amb`)
  if (bathrooms) parts.push(`${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}`)
  if (coveredArea) parts.push(`${coveredArea} m²`)
  return parts.join(" · ")
}

/** Pill de estado: la operación principal (venta tiene prioridad). */
function primaryOperationLabel({ operations }: PropertyCardData): string | null {
  if (!operations || operations.length === 0) return null
  const primary = operations.find((op) => op.type === "sale") ?? operations[0]
  return primary.type ? OPERATION_LABELS[primary.type] : null
}
