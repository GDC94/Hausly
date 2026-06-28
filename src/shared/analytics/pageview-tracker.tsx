"use client"

import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { useEffect } from "react"

/**
 * Pageviews manuales (specs/ANALYTICS.md §3): App Router NO captura navegaciones
 * solo, así que disparamos `$pageview` en cada cambio de ruta. Usa `usePathname` +
 * `useSearchParams` → DEBE ir dentro de un `<Suspense>` (si no, toda la página cae a
 * CSR). PostHog arranca opt-out → esto es no-op hasta el opt-in del banner (§6).
 */
export function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (posthog.__loaded !== true) return
    const search = searchParams.toString()
    const path = search ? `${pathname}?${search}` : pathname
    posthog.capture("$pageview", {
      $current_url: window.location.origin + path,
      path: pathname,
    })
  }, [pathname, searchParams])

  return null
}
