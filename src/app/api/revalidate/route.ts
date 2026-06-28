import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { parseBody } from "next-sanity/webhook"
import { z } from "zod"

/**
 * Webhook de Sanity → revalidación on-demand (specs/ARCHITECTURE.md §4).
 * Al publicar una propiedad, Sanity hace POST acá: se verifica la FIRMA con el
 * secret (`parseBody`), se valida el PAYLOAD con Zod y se revalida el tag
 * `property` — las vistas cacheadas se regeneran por contenido, no por TTL.
 *
 * Configurar en Sanity (manage → API → Webhooks), filtro `_type in
 * ["property","zone","agency"]`, proyección mínima:
 *   { "_type": _type, "slug": slug.current }
 *
 * En un delete/unpublish el documento ya no existe → la proyección puede no traer
 * `_type`. Por eso es opcional: si falta, revalidamos ambos tags como fallback.
 */
const payloadSchema = z.object({
  _type: z.string().min(1).nullish(),
  slug: z.string().nullish(),
})

const LISTING_TAGS = ["property", "zone"] as const

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<Record<string, unknown>>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      return new Response("Firma inválida", { status: 401 })
    }

    const parsed = payloadSchema.safeParse(body)
    if (!parsed.success) {
      return new Response("Payload inválido", { status: 400 })
    }

    // Revalida el tag que matchea el `_type` (property | zone | agency). Editar el
    // singleton `agency` debe refrescar el JSON-LD `RealEstateAgent` global. En
    // delete sin `_type` → revalida los listings como fallback, así una propiedad
    // borrada deja de verse. `{ expire: 0 }` = expiración INMEDIATA (no
    // stale-while-revalidate): el primer visitante tras el cambio ya ve lo nuevo.
    const type = parsed.data._type
    const tags = type === "property" || type === "zone" || type === "agency" ? [type] : LISTING_TAGS
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 })
    }

    return NextResponse.json({ revalidated: true, tags })
  } catch (error) {
    console.error("[revalidate] error:", error)
    return new Response("Error revalidando", { status: 500 })
  }
}
