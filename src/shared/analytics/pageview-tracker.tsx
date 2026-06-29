"use client"

import { usePathname } from "next/navigation"
import posthog from "posthog-js"
import { useEffect } from "react"

/**
 * Pageviews manuales (specs/ANALYTICS.md §3): App Router NO captura navegaciones
 * solo, así que disparamos `$pageview` en cada cambio de `pathname`. PostHog arranca
 * opt-out → esto es no-op hasta el opt-in del banner (§6).
 *
 * **Sólo el `pathname`, nunca el query string**: un param libre puede traer PII
 * (`/propiedades?q=ana@example.com`). Por eso NO suscribimos `useSearchParams` —
 * además, capturando sólo el pathname, re-disparar por cambio de query sólo generaría
 * un pageview duplicado. El contexto de filtros ya lo lleva `filter_applied` con una
 * allowlist (§1).
 */
export function PageviewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (posthog.__loaded !== true) return
    posthog.capture("$pageview", {
      $current_url: window.location.origin + pathname,
      path: pathname,
    })
  }, [pathname])

  return null
}
