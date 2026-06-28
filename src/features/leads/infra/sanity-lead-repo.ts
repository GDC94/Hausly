import "server-only"
import { createClient } from "next-sanity"
import { getSanityEnv } from "@/shared/sanity/env"
import type { LeadRepo, SavedLead } from "../lib/ports"

const { projectId, dataset, apiVersion } = getSanityEnv()

/**
 * Cliente con token de **ESCRITURA**: crear un `lead` requiere permiso de escritura,
 * a diferencia del `client` de lectura (specs/SANITY-SCHEMA.md, dataset privado).
 * Server-only, nunca expuesto al cliente. Necesita `SANITY_API_WRITE_TOKEN` en el
 * entorno (Vercel) — sin él, `create` devuelve 401 y el Server Action reporta error.
 */
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: "published",
})

/**
 * Adapter de persistencia (specs/ARCHITECTURE.md §3). Mapea el `LeadInput` validado
 * al doc `lead` de Sanity y lo crea como registro durable. `status: "new"` y
 * `source` siguen el schema (specs/SANITY-SCHEMA.md). Sólo persiste los campos con
 * valor (omite vacíos) para no ensuciar el documento.
 */
export const sanityLeadRepo: LeadRepo = {
  async save(input): Promise<SavedLead> {
    const created = await writeClient.create({
      _type: "lead",
      name: input.name,
      ...(input.email?.trim() ? { email: input.email.trim() } : {}),
      ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
      ...(input.message?.trim() ? { message: input.message.trim() } : {}),
      source: input.source,
      status: "new",
      ...(input.propertyId ? { property: { _type: "reference", _ref: input.propertyId } } : {}),
    })
    return { _id: created._id }
  },
}
