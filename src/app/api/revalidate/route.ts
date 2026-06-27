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
 * Configurar en Sanity (manage → API → Webhooks) con una proyección mínima:
 *   { "_type": _type, "slug": slug.current }
 */
const payloadSchema = z.object({
  _type: z.string().min(1),
  slug: z.string().nullish(),
})

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

    // Next 16: `revalidateTag` exige un perfil de cache life. `updateTag` no
    // sirve acá (sólo corre en Server Actions, no en route handlers). Para
    // purgar el tag desde el webhook → perfil "max".
    revalidateTag("property", "max")

    return NextResponse.json({ revalidated: true, type: parsed.data._type })
  } catch (error) {
    console.error("[revalidate] error:", error)
    return new Response("Error revalidando", { status: 500 })
  }
}
