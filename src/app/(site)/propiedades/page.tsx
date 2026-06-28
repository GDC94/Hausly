import type { Metadata } from "next"
import Link from "next/link"
import { getProperties, LoadMore, PropertyGrid } from "@/features/properties"
import { getZones, parseOffset, parseSearchParams, SearchFilters } from "@/features/search"

export const metadata: Metadata = {
  title: "Propiedades",
  description: "Casas, departamentos y más en venta y alquiler en las mejores zonas.",
}

type RawSearchParams = Record<string, string | string[] | undefined>

// Listado filtrado por facetas y paginado por lotes ("Cargar más"), cacheado por
// tags (`['property','zone']`): publicar en Sanity revalida vía webhook, no por
// TTL (specs/ARCHITECTURE.md §4). La página sólo orquesta: parsea `searchParams`
// (única fuente de verdad, specs/FILTERS.md §3), arma filtros + offset y compone
// los componentes del feature.
export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const sp = await searchParams
  const filters = parseSearchParams(sp)
  const offset = parseOffset(sp.offset)
  const [{ items, total }, zones] = await Promise.all([getProperties(filters, offset), getZones()])

  const loaded = items.length
  const hasMore = loaded < total

  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-10 lg:py-14">
      <header>
        <h1 className="text-heading text-foreground">Propiedades</h1>
        {/* `aria-live` anuncia los lotes nuevos del "Cargar más" sin recargar
            (specs/FILTERS.md §5): al sumar un lote, `loaded` cambia y el lector
            de pantalla lee el conteo actualizado. */}
        <p aria-live="polite" className="mt-2 text-body-sm text-muted-foreground">
          {hasMore
            ? `Mostrando ${loaded} de ${total} propiedades`
            : `${total} ${total === 1 ? "propiedad" : "propiedades"}`}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SearchFilters filters={filters} zones={zones} />
        </aside>

        <div>
          {total > 0 ? (
            <>
              <PropertyGrid properties={items} />
              {hasMore ? <LoadMore href={buildOffsetHref(sp, loaded)} /> : null}
            </>
          ) : (
            <div className="rounded-lg border border-dashed px-6 py-16 text-center">
              <p className="text-body text-foreground">
                No encontramos propiedades con esos filtros.
              </p>
              <Link
                href="/propiedades"
                className="mt-2 inline-block text-body-sm text-link underline-offset-4 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * URL crawleable del siguiente lote: conserva todos los filtros activos y fija el
 * `offset` en la cantidad ya cargada (specs/FILTERS.md §4). El próximo render pide
 * `[0...$end]` con `end = nextOffset + PAGE_SIZE`, acumulando el listado.
 */
function buildOffsetHref(sp: RawSearchParams, nextOffset: number): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(sp)) {
    if (key === "offset" || value === undefined) continue
    if (Array.isArray(value)) for (const v of value) params.append(key, v)
    else params.set(key, value)
  }
  params.set("offset", String(nextOffset))
  return `/propiedades?${params.toString()}`
}
