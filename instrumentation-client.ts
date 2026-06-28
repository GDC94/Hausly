import posthog from "posthog-js"

/**
 * Init de PostHog del lado cliente (specs/ANALYTICS.md §2). Next 16 ejecuta este
 * archivo al arrancar el cliente — carga diferida, no amenaza CWV (§7).
 *
 * Decisiones clave:
 * - `api_host: "/ingest"` → reverse proxy (next.config) → menos bloqueo de adblock.
 * - `opt_out_capturing_by_default: true` → arranca en opt-out; `capture()` es no-op
 *   hasta que el banner llame `opt_in_capturing()` (§6). El consentimiento se respeta
 *   en UN solo lugar.
 * - `capture_pageview: false` → App Router NO auto-captura navegaciones; el
 *   `PageviewTracker` las dispara a mano (§3).
 * - Sin session replay (§7): pesado para CWV/privacidad.
 *
 * Sin env (preview/build sin claves) → no inicializa: el wrapper queda no-op.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

if (key) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
    capture_pageview: false,
    capture_pageleave: true,
    opt_out_capturing_by_default: true,
    persistence: "localStorage+cookie",
    disable_session_recording: true,
  })
}
