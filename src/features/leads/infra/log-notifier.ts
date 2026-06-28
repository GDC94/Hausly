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
 *
 * **No loguea PII** (nombre/email/teléfono): los datos de contacto viven en el
 * dataset privado de Sanity, no deben filtrarse a los logs de la app. Sólo el id
 * del lead y el contexto de propiedad — suficiente para trazar.
 */
export const logNotifier: LeadNotifier = {
  async notify(lead, input) {
    console.info(
      `[leads] nueva consulta ${lead._id}` +
        (input.propertyId ? ` · propiedad ${input.propertyId}` : " · consulta general"),
    )
  },
}
