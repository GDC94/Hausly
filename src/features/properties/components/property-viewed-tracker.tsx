"use client"

import { useEffect } from "react"
import { ANALYTICS_EVENTS, capture } from "@/shared/analytics"
import type { PropertyViewedProps } from "../lib/property-viewed"

/**
 * Dispara `property_viewed` (specs/ANALYTICS.md §4) al montar el detalle. Isla
 * client mínima que NO renderiza nada: las props ya vienen derivadas en el servidor
 * (`buildPropertyViewedProps`), sin PII ni precio exacto. No-op hasta opt-in (el
 * gate vive en `capture()`).
 */
export function PropertyViewedTracker(props: PropertyViewedProps) {
  const { propertyId, zone, operation, priceBucket } = props

  useEffect(() => {
    capture({ event: ANALYTICS_EVENTS.propertyViewed, propertyId, zone, operation, priceBucket })
  }, [propertyId, zone, operation, priceBucket])

  return null
}
