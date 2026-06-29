import posthog from "posthog-js"
import type { AnalyticsEvent } from "./events"

/**
 * Wrapper de captura tipado (specs/ANALYTICS.md §3). El ÚNICO gate de
 * consentimiento: es no-op hasta el opt-in (§6). Ningún call site espolvorea checks
 * de consent ni tipea el nombre del evento suelto — la complejidad queda escondida
 * tras esta interfaz. Los componentes llaman `capture({ event, ...props })` y listo.
 *
 * El tipo `AnalyticsEvent` es una union discriminada: TS exige las props correctas
 * para cada `event` y rechaza las equivocadas o faltantes en compile-time.
 */
export function capture({ event, ...props }: AnalyticsEvent): void {
  // Doble candado: PostHog ya arranca opt-out (init), y acá igual chequeamos. Si no
  // hay env (sin init) o no hubo opt-in, no se captura nada.
  if (posthog.__loaded !== true || !posthog.has_opted_in_capturing()) return
  posthog.capture(event, props)
}

/**
 * `distinct_id` del visitante, para propagarlo al Server Action y linkear el
 * `lead_submitted` server-side al recorrido previo (specs/ANALYTICS.md §5). Devuelve
 * `null` si PostHog no está cargado (sin env).
 */
export function getDistinctId(): string | null {
  if (posthog.__loaded !== true) return null
  return posthog.get_distinct_id()
}
