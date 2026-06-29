"use client"

import { useEffect } from "react"
import { ANALYTICS_EVENTS, capture } from "@/shared/analytics"

type ListingTelemetryProps = {
  /** Filtros activos (raw de la URL, sin `offset`) — vacío = listado sin filtrar. */
  filters: Record<string, string>
  /** Lote de paginación: `0` = primer lote, `>0` = vino de "Cargar más". */
  offset: number
}

/**
 * Telemetría del listado (specs/ANALYTICS.md §4): `filter_applied` y
 * `load_more_clicked`. El listado es un Server Component con form GET (URL = única
 * fuente de verdad, specs/FILTERS.md §3) → no hay onClick donde colgar el evento.
 * Esta isla deriva los eventos del **estado de la URL**: si hay filtros activos,
 * `filter_applied`; si `offset>0`, el visitante pidió otro lote (`load_more_clicked`).
 * Re-dispara cuando cambia la URL (la `key` serializada en deps). No-op hasta opt-in.
 */
export function ListingTelemetry({ filters, offset }: ListingTelemetryProps) {
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    const active: Record<string, string> = JSON.parse(filtersKey)
    if (Object.keys(active).length > 0) {
      capture({ event: ANALYTICS_EVENTS.filterApplied, filters: active })
    }
    if (offset > 0) {
      capture({ event: ANALYTICS_EVENTS.loadMoreClicked, offset })
    }
  }, [filtersKey, offset])

  return null
}
