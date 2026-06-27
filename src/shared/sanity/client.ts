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
 * Lectura tipada server-side. La invalidación es por tags (ver ARCHITECTURE §4):
 * las queries pasan los tags del contenido que tocan (ej. ['property']) y el
 * webhook de Sanity hace revalidateTag.
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
    next: { tags },
  })
}
