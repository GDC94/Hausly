import { defineQuery } from "next-sanity"
import { sanityFetch } from "@/shared/sanity/client"
import type { ZoneBySlugQueryResult, ZoneSlugsQueryResult } from "@/shared/sanity/sanity.types"

/**
 * Zona individual por slug para la **landing por zona** (issue #10,
 * specs/SEO.md §7). Proyecta sólo lo que la intro indexable necesita: `name`
 * (H1/title geográfico), `description` (texto SEO local) y el `slug` ya
 * desreferenciado (canonical). Cacheada por el tag `zone`: editar la zona en
 * Sanity revalida vía webhook `/api/revalidate` (specs/ARCHITECTURE.md §4).
 *
 * Devuelve `null` si el slug no existe → la página llama `notFound()`.
 */
export const zoneBySlugQuery = defineQuery(`
  *[_type == "zone" && slug.current == $slug][0] {
    name,
    "slug": slug.current,
    description
  }
`)

/**
 * Slugs de todas las zonas para `generateStaticParams` (specs/ARCHITECTURE.md §4):
 * una ruta estática por `zone`. Eje finito → se pre-generan todas en el build.
 */
export const zoneSlugsQuery = defineQuery(`
  *[_type == "zone" && defined(slug.current)]{ "slug": slug.current }
`)

export async function getZone(slug: string): Promise<ZoneBySlugQueryResult> {
  return sanityFetch<ZoneBySlugQueryResult>({
    query: zoneBySlugQuery,
    params: { slug },
    tags: ["zone"],
  })
}

/** Todos los slugs de zona publicados, para `generateStaticParams`. */
export async function getZoneSlugs(): Promise<ZoneSlugsQueryResult> {
  return sanityFetch<ZoneSlugsQueryResult>({ query: zoneSlugsQuery, tags: ["zone"] })
}
