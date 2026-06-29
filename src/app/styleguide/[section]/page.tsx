import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isBlocked } from "../_lib/blindaje"
import { getSection, SECTIONS } from "../_lib/sections"

type Params = { params: Promise<{ section: string }> }

// Sólo las secciones del registro son válidas; cualquier otra → 404 (no dinámicas).
export const dynamicParams = false

/**
 * **Capa 1 del blindaje (corte gemelo, specs/STYLEGUIDE.md §2):** en producción devuelve
 * `[]` → cero prerender → cero fetch GROQ en el build para una ruta que será 404. Sin
 * este corte, el build de prod ejecutaría los fetches de cada sección ANTES de que el
 * layout decida el 404, y un fallo de Sanity rompería el build por una ruta interna.
 */
export function generateStaticParams() {
  if (isBlocked(process.env.VERCEL_ENV)) return []
  return SECTIONS.map((section) => ({ section: section.key }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { section } = await params
  const entry = getSection(section)
  return { title: entry ? `${entry.title} · Styleguide` : "Styleguide" }
}

/**
 * Dispatcher de sección (specs/STYLEGUIDE.md §3): busca la entrada por `key` y renderiza
 * su `Specimen`. No sabe qué pinta cada sección — eso vive en `_sections/{key}.tsx`.
 * Sección desconocida → `notFound()`.
 */
export default async function SectionPage({ params }: Params) {
  const { section } = await params
  const entry = getSection(section)
  if (!entry) notFound()

  const { Specimen, title, description } = entry
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading text-foreground">{title}</h1>
        <p className="text-body text-muted-foreground">{description}</p>
      </header>
      <Specimen />
    </article>
  )
}
