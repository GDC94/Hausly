import posthog from "posthog-js"

/**
 * Gestión del consentimiento (specs/ANALYTICS.md §6). PostHog persiste el estado en
 * cookie/localStorage → habilita el funnel cross-session. El banner es el único que
 * llama estas funciones; `capture()` (no-op hasta opt-in) lee el estado resultante.
 */

/** El visitante aceptó → habilita la captura (incl. el funnel de pageviews). */
export function grantConsent(): void {
  posthog.opt_in_capturing()
}

/** El visitante rechazó → PostHog queda en opt-out (no captura). El estado persiste. */
export function denyConsent(): void {
  posthog.opt_out_capturing()
}

/** `true` si ya hay captura habilitada. Lo usa el gate de `capture()`. */
export function hasConsent(): boolean {
  return posthog.__loaded === true && posthog.has_opted_in_capturing()
}

/**
 * `true` si el visitante YA decidió (aceptó o rechazó). El banner se oculta cuando
 * esto es `true` — así no reaparece en cada visita.
 */
export function hasDecidedConsent(): boolean {
  if (posthog.__loaded !== true) return true // sin PostHog (sin env): no muestres banner
  return posthog.has_opted_in_capturing() || posthog.has_opted_out_capturing()
}
