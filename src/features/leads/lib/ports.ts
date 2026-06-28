import type { LeadInput } from "../schemas/lead-schema"

/**
 * Puertos del core de leads (arquitectura hexagonal, specs/ARCHITECTURE.md §3). El
 * core `createLead` depende de estas interfaces, no de Sanity/Resend/PostHog
 * concretos: el Server Action cablea los adapters reales y los tests, fakes.
 */

/** Lead ya persistido (lo mínimo que el core necesita: su id). */
export type SavedLead = { _id: string }

/** Persistencia durable del lead (adapter real: Sanity). */
export interface LeadRepo {
  save(input: LeadInput): Promise<SavedLead>
}

/** Notificación de la consulta (adapter real: Resend — hoy un tapón que loguea). */
export interface LeadNotifier {
  notify(lead: SavedLead, input: LeadInput): Promise<void>
}

/** Medición del evento de negocio (adapter real: PostHog, issue #14 — hoy no-op). */
export interface LeadAnalytics {
  track(event: "lead_submitted", props: Record<string, unknown>): Promise<void> | void
}

/** Dependencias inyectadas al core. */
export type LeadDeps = {
  repo: LeadRepo
  notifier: LeadNotifier
  analytics: LeadAnalytics
}
