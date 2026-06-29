import type { Currency } from "@/shared/lib/format-price"
import type { OperationTypeValue } from "@/shared/types"

/**
 * Nombres de evento en UN solo lugar (specs/ANALYTICS.md §3): un contrato tipado,
 * no un string suelto tipeado en cada componente. **Un concepto = una fuente.**
 * snake_case, sin PII.
 */
export const ANALYTICS_EVENTS = {
  searchFromHome: "search_from_home",
  filterApplied: "filter_applied",
  loadMoreClicked: "load_more_clicked",
  propertyViewed: "property_viewed",
  whatsappClicked: "whatsapp_clicked",
  leadSubmitted: "lead_submitted",
} as const

/** Operación del dominio (specs/DOMAIN.md, `OPERATION_TYPES`): sale/rent/temporaryRent. */
export type Operation = OperationTypeValue

/**
 * Payloads tipados POR evento (specs/ANALYTICS.md §3): una union discriminada por
 * `event` mapea cada nombre a sus props requeridas. Así `capture()` rechaza en
 * compile-time props equivocadas o faltantes para ese evento — no sólo el nombre.
 *
 * `lead_submitted` NO está acá: es server-side (§5), se captura con `posthog-node`
 * fuera de este wrapper de cliente.
 */
export type AnalyticsEvent =
  | {
      event: typeof ANALYTICS_EVENTS.searchFromHome
      operation: Operation | "any"
      zone: string | null
    }
  | { event: typeof ANALYTICS_EVENTS.filterApplied; filters: Record<string, string> }
  | { event: typeof ANALYTICS_EVENTS.loadMoreClicked; offset: number }
  | {
      event: typeof ANALYTICS_EVENTS.propertyViewed
      propertyId: string
      zone: string | null
      operation: Operation | null
      priceBucket: string
    }
  | { event: typeof ANALYTICS_EVENTS.whatsappClicked; source: string }

/** Nombre del evento de lead (server-side, §5). Compartido con el adapter de leads. */
export const LEAD_SUBMITTED = ANALYTICS_EVENTS.leadSubmitted

export type { Currency }
