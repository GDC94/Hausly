import type { SlugValidationContext } from "sanity"

/**
 * Validación async de slug único dentro del mismo document type (ignora el draft
 * y la versión publicada del propio documento). Patrón oficial de Sanity.
 */
export async function isUniqueSlug(slug: string, context: SlugValidationContext): Promise<boolean> {
  const { document, getClient } = context
  if (!document) return true

  const client = getClient({ apiVersion: "2025-01-01" })
  const id = document._id.replace(/^drafts\./, "")
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
    type: document._type,
  }
  const query = `!defined(*[_type == $type && !(_id in [$draft, $published]) && slug.current == $slug][0]._id)`
  return client.fetch(query, params)
}
