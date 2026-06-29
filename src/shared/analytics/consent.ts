import posthog from "posthog-js"

/**
 * Gestión del consentimiento (specs/ANALYTICS.md §6). El registro de la DECISIÓN del
 * visitante vive en un flag propio de `localStorage` —NO en el estado opt-out de
 * PostHog—, por dos razones:
 *
 * 1. PostHog arranca con `opt_out_capturing_by_default: true`, así que
 *    `has_opted_out_capturing()` ya es `true` ANTES de que el visitante decida. Si el
 *    banner se guiara por eso, vería una "decisión" falsa y nunca se mostraría → el
 *    opt-in jamás ocurre y el funnel queda muerto.
 * 2. Hasta el opt-in, PostHog corre con `persistence: "memory"` (sin cookies ni
 *    localStorage del SDK): no se escribe storage de analytics antes del consentimiento.
 *    Recién al aceptar se eleva la persistencia para habilitar el funnel cross-session.
 *
 * El flag de decisión SÍ se guarda (es funcional/necesario: que el banner no reaparezca),
 * pero no es tracking ni lleva PII.
 */
const CONSENT_KEY = "hausly_analytics_consent"
type ConsentDecision = "granted" | "denied"

function readDecision(): ConsentDecision | null {
  if (typeof window === "undefined") return null
  const value = window.localStorage.getItem(CONSENT_KEY)
  return value === "granted" || value === "denied" ? value : null
}

function writeDecision(decision: ConsentDecision): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CONSENT_KEY, decision)
}

/** El visitante aceptó → eleva la persistencia y habilita la captura (funnel cross-session). */
export function grantConsent(): void {
  writeDecision("granted")
  // Recién acá el SDK puede escribir cookie/localStorage (antes corría en memoria).
  posthog.set_config({ persistence: "localStorage+cookie" })
  posthog.opt_in_capturing()
}

/** El visitante rechazó → PostHog queda en opt-out (no captura). La decisión persiste. */
export function denyConsent(): void {
  writeDecision("denied")
  posthog.opt_out_capturing()
}

/** `true` si el visitante aceptó. Lo usa el gate de `capture()` y el lead server-side. */
export function hasConsent(): boolean {
  return readDecision() === "granted"
}

/**
 * `true` si el visitante YA decidió (aceptó o rechazó) — el banner se oculta cuando lo
 * es. En SSR (sin `window`) devuelve `true` para no parpadear el banner en el server;
 * el effect del cliente lo recalcula al montar.
 */
export function hasDecidedConsent(): boolean {
  if (typeof window === "undefined") return true
  return readDecision() !== null
}
