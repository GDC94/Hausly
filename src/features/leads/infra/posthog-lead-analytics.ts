import { LEAD_SUBMITTED } from "@/shared/analytics/events"
import { captureServer } from "@/shared/analytics/server"
import type { LeadAnalytics } from "../lib/ports"

/**
 * Adapter real del puerto `LeadAnalytics` (specs/ANALYTICS.md §5): captura
 * `lead_submitted` server-side con PostHog tras persistir el lead. Se construye con
 * el `distinctId` del visitante en el Server Action → así el evento queda linkeado a
 * su recorrido previo (pageviews, filtros, detalle). El core invoca `track()` igual;
 * sólo este adapter conoce PostHog (hexagonal, specs/ARCHITECTURE.md §3).
 *
 * Importa de `@/shared/analytics/server` (no del barrel) para NO arrastrar
 * `posthog-js` (cliente) a un módulo de servidor.
 */
export function posthogLeadAnalytics(distinctId: string | null): LeadAnalytics {
  return {
    async track(_event, props) {
      // Traduce el `leadId` de dominio a propiedades de PERSONA de PostHog (`$set`):
      // marca al visitante anónimo como convertido y guarda el ref al lead. Así el
      // recorrido previo (mismo `distinct_id`) queda atado a la conversión, y el
      // `leadId` es el puente a la PII en Sanity (specs/ANALYTICS.md §5). Sigue sin
      // PII en PostHog: `leadId` es un ref, no un dato personal.
      const leadId = props.leadId
      await captureServer({
        distinctId,
        event: LEAD_SUBMITTED,
        properties: {
          ...props,
          $set: { converted: true, last_lead_id: leadId },
        },
      })
    },
  }
}
