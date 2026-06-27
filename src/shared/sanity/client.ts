import "server-only"
import { createClient, type QueryParams } from "next-sanity"
import { getSanityEnv } from "./env"

const { projectId, dataset, apiVersion } = getSanityEnv()

// Token server-only: el dataset es privado (protege PII de leads), así que toda
// lectura va autenticada. Nunca se expone al cliente (no es NEXT_PUBLIC).
const token = process.env.SANITY_API_READ_TOKEN

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: "published",
})

/**
 * Lectura tipada server-side, **cacheada e invalidada por tags** (ver
 * ARCHITECTURE §4): las queries pasan los tags del contenido que tocan
 * (ej. ['property']) y el webhook de Sanity hace `revalidateTag`.
 *
 * `cache: "force-cache"` es obligatorio: en Next 16 `fetch` es `no-store` por
 * defecto, así que sin esto la query NO se cachearía y el tag no tendría nada
 * que invalidar. Con force-cache + tags, la vista caliente se sirve del cache y
 * se regenera por contenido (no por TTL).
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: QueryParams
  tags?: string[]
}): Promise<T> {
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { tags },
  })
}
