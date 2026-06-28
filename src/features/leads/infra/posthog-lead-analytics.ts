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
      await captureServer({ distinctId, event: LEAD_SUBMITTED, properties: props })
    },
  }
}
