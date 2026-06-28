import "server-only"
import { randomUUID } from "node:crypto"
import { PostHog } from "posthog-node"

/**
 * Captura server-side (specs/ANALYTICS.md §5). El evento de lead se mide acá, no en
 * el cliente: es el evento-plata (consulta = posible venta) y server-side **ningún
 * adblocker lo tira**. Cero PII — sólo ids, refs y buckets (Sanity guarda la PII).
 *
 * Funciones cortas → `flushAt: 1` + `flushInterval: 0` + `shutdown()`: flush
 * inmediato antes de responder, sin perder el evento. Sin env (preview/build sin
 * claves) → no-op silencioso.
 */
export async function captureServer(params: {
  /** `distinct_id` propagado desde el cliente → linkea el evento al recorrido (§5). */
  distinctId: string | null | undefined
  event: string
  properties?: Record<string, unknown>
}): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  const ph = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
  try {
    // Sin distinctId del cliente, el lead igual se registra (no se pierde el
    // evento-plata) aunque quede sin linkear al recorrido previo.
    ph.capture({
      distinctId: params.distinctId || randomUUID(),
      event: params.event,
      properties: params.properties,
    })
    await ph.shutdown()
  } catch (error) {
    console.error("[analytics] captura server-side falló:", error)
  }
}
