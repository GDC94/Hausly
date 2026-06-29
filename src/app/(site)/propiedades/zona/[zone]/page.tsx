import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  buildZoneListingHref,
  buildZoneMetadata,
  getProperties,
  PropertyGrid,
  zoneHeading,
} from "@/features/properties"
import { getZone, getZoneSlugs, SearchFilters } from "@/features/search"

// Param de ruta en INGLÉS (contrato de idioma: código/carpetas en inglés, URLs en
// español). El segmento estático `zona/` mantiene la URL `/propiedades/zona/<slug>`
// en español; el nombre de la carpeta dinámica `[zone]` no aparece en la URL.
type Params = Promise<{ zone: string }>

// Landing por zona ESTÁTICA (specs/ARCHITECTURE.md §4, specs/SEO.md §7): una ruta
// por `zone`, pre-generada en el build. Es el eje SEO local indexable con canonical
// propio — a diferencia del listado filtrado por `searchParams` (noindex). Por eso
// la página depende SÓLO de `params` (no lee `searchParams`): así Next la pre-renderiza
// 100% estática. El filtrado/paginación libre "sale" a `/propiedades?zone=…`.
export async function generateStaticParams() {
  const slugs = await getZoneSlugs()
  return slugs.filter((z): z is { slug: string } => Boolean(z.slug)).map((z) => ({ zone: z.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { zone: slug } = await params
  const zone = await getZone(slug)
  // `slug` (param de la ruta) ES el slug matcheado — lo usamos porque el TypeGen
  // tipa `slug.current` como nullable y acá ya sabemos que existe.
  return zone ? buildZoneMetadata({ name: zone.name, slug, description: zone.description }) : {}
}

export default async function ZoneLandingPage({ params }: { params: Params }) {
  const { zone: slug } = await params
  const [zone, { items, total }] = await Promise.all([
    getZone(slug),
    // Reusa el listado filtrado (issue #5-#8): zona fijada por la ruta, primera
    // página (offset 0). No hay "Cargar más" in-place porque eso requeriría
    // `searchParams` (rompería el estático); el excedente se ve en el listado.
    getProperties({ zones: [slug] }, 0),
  ])
  if (!zone) notFound()

  const heading = zoneHeading(zone.name)
  const hasMore = items.length < total
  const listingHref = buildZoneListingHref(slug)

  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-10 lg:py-14">
      <header className="max-w-prose">
        <h1 className="text-heading text-foreground">{heading}</h1>
        {zone.description ? (
          <p className="mt-3 text-body text-muted-foreground">{zone.description}</p>
        ) : null}
        <p className="mt-2 text-body-sm text-muted-foreground">
          {total} {total === 1 ? "propiedad" : "propiedades"}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* La zona la fija la ruta (siempre el slug matcheado, exista o no `name`):
              el slug es lo que conserva el scope al enviar filtros, así que se pasa
              siempre — no se gatea en `name`. */}
          <SearchFilters filters={{}} zones={[]} lockedZoneSlug={slug} />
        </aside>

        <div>
          {/* Encabezado de la región de resultados: evita el salto h1→h3 de las
              `PropertyCard` (heading-order, specs/SEO.md §6). sr-only: el `h1` y el
              conteo ya lo comunican visualmente. */}
          <h2 className="sr-only">Propiedades en {zone.name ?? "esta zona"}</h2>
          {total > 0 ? (
            <>
              <PropertyGrid properties={items} />
              {hasMore ? (
                <div className="mt-10 flex justify-center">
                  <Link
                    href={listingHref}
                    className="text-body-sm text-link underline-offset-4 hover:underline"
                  >
                    Ver todas las {total} propiedades en {zone.name ?? "esta zona"}
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-dashed px-6 py-16 text-center">
              <p className="text-body text-foreground">
                Todavía no hay propiedades publicadas en esta zona.
              </p>
              <Link
                href="/propiedades"
                className="mt-2 inline-block text-body-sm text-link underline-offset-4 hover:underline"
              >
                Ver todas las propiedades
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
