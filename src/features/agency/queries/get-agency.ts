import { defineQuery } from "next-sanity"
import { sanityFetch } from "@/shared/sanity/client"
import type { AgencyQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Singleton `agency` (specs/SANITY-SCHEMA.md): fuente única del NAP/branding para
 * el JSON-LD `RealEstateAgent` global (specs/SEO.md §4.2). Proyecta sólo lo que el
 * dato estructurado necesita. Devuelve `null` si el documento no existe todavía
 * en el dataset → el builder cae al fallback de `site.ts`.
 *
 * Cacheada por el tag `agency`: editar la inmobiliaria en Sanity revalida vía
 * webhook (specs/ARCHITECTURE.md §4).
 */
export const agencyQuery = defineQuery(`
  *[_type == "agency"][0]{
    name,
    phone,
    email,
    address,
    logo,
    socials
  }
`)

export async function getAgency(): Promise<AgencyQueryResult> {
  return sanityFetch<AgencyQueryResult>({ query: agencyQuery, tags: ["agency"] })
}
