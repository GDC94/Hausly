import { type Operation, toPriceBucket } from "@/shared/analytics"
import type { PropertyDetail } from "../types"

/** Props del evento `property_viewed` (specs/ANALYTICS.md §4) — sin PII, sin precio exacto. */
export type PropertyViewedProps = {
  propertyId: string
  zone: string | null
  operation: Operation | null
  priceBucket: string
}

/**
 * Deriva las props de `property_viewed` desde el detalle (specs/ANALYTICS.md §4).
 * Pura → testeada (TDD): toma la PRIMERA operación como la primaria y bucketiza su
 * precio (nunca el monto exacto). Vive en el feature `properties` (es presentación
 * del detalle); el tracker cliente sólo dispara el evento con estas props.
 */
export function buildPropertyViewedProps(property: PropertyDetail): PropertyViewedProps {
  const primary = property.operations?.[0]
  const operation = primary?.type ?? null
  const priceBucket = toPriceBucket(primary?.price?.amount, primary?.price?.currency ?? "USD")

  return {
    propertyId: property._id,
    zone: property.location?.zone?.slug ?? null,
    operation,
    priceBucket,
  }
}
