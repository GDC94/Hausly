"use server"

import { logNotifier } from "../infra/log-notifier"
import { noopLeadAnalytics, posthogLeadAnalytics } from "../infra/posthog-lead-analytics"
import { sanityLeadRepo } from "../infra/sanity-lead-repo"
import { createLead } from "../lib/create-lead"
import { leadSchema } from "../schemas/lead-schema"

/** Estado que el Server Action devuelve al `LeadForm` para pintar feedback. */
export type LeadFormState = {
  status: "success" | "error"
  message: string
  /** Errores por campo cuando la re-validación server-side falla. */
  fieldErrors?: Record<string, string>
}

/**
 * Server Action de envío de consulta (specs/ARCHITECTURE.md §3). Es un **adapter
 * fino**: re-valida con el MISMO `leadSchema` (nunca confiar en el cliente),
 * cablea los adapters reales y delega TODA la orquestación + invariante de orden
 * en el core `createLead`. El Resend real está diferido → `logNotifier` (tapón).
 */
export async function submitLead(
  raw: unknown,
  /**
   * `distinct_id` de PostHog propagado por el cliente (specs/ANALYTICS.md §5): linkea
   * el `lead_submitted` server-side al recorrido previo del visitante. Opcional —
   * sin él (adblock total / sin opt-in) el lead se guarda igual, sólo sin linkear.
   */
  distinctId?: string | null,
  /**
   * `true` si el visitante consintió la medición (specs/ANALYTICS.md §6). El gate de
   * consentimiento también vale server-side: sin opt-in NO se manda `lead_submitted` a
   * PostHog (el lead igual se persiste en Sanity — eso es la transacción de negocio).
   */
  consented?: boolean,
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { status: "error", message: "Revisá los datos del formulario.", fieldErrors }
  }

  try {
    // `source` se DERIVA en el servidor, no se confía en el cliente: este action es
    // el canal "form". Un hidden input es manipulable (podría llegar "whatsapp" y
    // ensuciar la atribución), así que se sobrescribe acá.
    await createLead(
      { ...parsed.data, source: "form" },
      {
        repo: sanityLeadRepo,
        notifier: logNotifier,
        // Sin consentimiento → adapter no-op: el lead se guarda, pero nada va a PostHog.
        analytics: consented ? posthogLeadAnalytics(distinctId ?? null) : noopLeadAnalytics,
      },
    )
    return {
      status: "success",
      message: "¡Gracias por tu consulta! Te vamos a contactar a la brevedad.",
    }
  } catch (error) {
    console.error("[leads] no se pudo guardar la consulta:", error)
    return {
      status: "error",
      message: "No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.",
    }
  }
}
