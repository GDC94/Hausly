import type { LeadInput } from "../schemas/lead-schema"
import type { LeadDeps } from "./ports"

export type CreateLeadResult = {
  /** `_id` del lead persistido. */
  id: string
  /** `true` si además se notificó OK; `false` si la notificación falló (el lead igual quedó guardado). */
  notified: boolean
}

/**
 * Core de creación de lead (specs/ARCHITECTURE.md §3). Orquestación con deps
 * inyectadas — sin tocar Sanity/Resend/PostHog directos, por eso se testea con
 * fakes (specs/TESTING.md).
 *
 * **INVARIANTE DE ORDEN (la regla sagrada):** se persiste el lead PRIMERO y se
 * notifica DESPUÉS. Un lead = posible venta: si la notificación (Resend) falla, la
 * consulta YA quedó guardada y no se pierde. Por eso `notify` va dentro de un
 * try/catch que NO propaga — degradar la notificación es aceptable; perder el lead,
 * jamás. En cambio, si `save` falla, sí se propaga: no hay consulta que avisar.
 *
 * Analytics es best-effort: un fallo de medición nunca debe romper la captura del
 * lead (issue #14 cablea PostHog; hoy es no-op).
 */
export async function createLead(
  input: LeadInput,
  { repo, notifier, analytics }: LeadDeps,
): Promise<CreateLeadResult> {
  // (1) PERSISTE — si esto falla, propaga: no hay lead.
  const lead = await repo.save(input)

  // (2) NOTIFICA — best-effort: el lead ya está a salvo.
  let notified = false
  try {
    await notifier.notify(lead, input)
    notified = true
  } catch (error) {
    console.error("[leads] notificación falló (el lead ya quedó guardado):", error)
  }

  try {
    await analytics.track("lead_submitted", {
      source: input.source,
      hasProperty: Boolean(input.propertyId),
    })
  } catch (error) {
    console.error("[leads] analytics falló:", error)
  }

  return { id: lead._id, notified }
}
