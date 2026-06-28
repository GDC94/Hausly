import type { LeadAnalytics } from "../lib/ports"

/**
 * Analytics no-op. El evento `lead_submitted` server-side se cablea con PostHog en
 * el issue #14 (specs/ANALYTICS.md §5); hasta entonces el puerto existe pero no
 * mide. El core lo invoca igual — así #14 sólo cambia este adapter.
 */
export const noopAnalytics: LeadAnalytics = {
  track() {},
}
