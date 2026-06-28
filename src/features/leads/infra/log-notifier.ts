import "server-only"
import type { LeadNotifier } from "../lib/ports"

/**
 * **TAPÓN de notificación (Resend DIFERIDO).** El issue #11 deja la notificación
 * como puerto; el adapter real de Resend (API key + dominio verificado + from/to)
 * se cablea en una sesión posterior. Por ahora loguea server-side para no perder
 * visibilidad de las consultas mientras tanto.
 *
 * Cuando se cablee Resend, este adapter se reemplaza por `resendNotifier` en el
 * Server Action — el core `createLead` no cambia (esa es la gracia del puerto).
 */
export const logNotifier: LeadNotifier = {
  async notify(lead, input) {
    console.info(
      `[leads] nueva consulta ${lead._id} — ${input.name} (${input.email || input.phone || "sin contacto"})` +
        (input.propertyId ? ` · propiedad ${input.propertyId}` : " · consulta general"),
    )
  },
}
