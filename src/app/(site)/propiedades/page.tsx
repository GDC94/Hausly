import type { Metadata } from "next"
import Link from "next/link"
import { getProperties, PropertyGrid } from "@/features/properties"
import { getZones, parseSearchParams, SearchFilters } from "@/features/search"

export const metadata: Metadata = {
  title: "Propiedades",
  description: "Casas, departamentos y más en venta y alquiler en las mejores zonas.",
}

// Listado filtrado por facetas, cacheado por tags (`['property','zone']`):
// publicar en Sanity revalida vía webhook, no por TTL (specs/ARCHITECTURE.md §4).
// La página sólo orquesta: parsea `searchParams` (única fuente de verdad,
// specs/FILTERS.md §3), arma los filtros y compone los componentes del feature.
export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseSearchParams(await searchParams)
  const [properties, zones] = await Promise.all([getProperties(filters), getZones()])
  const count = properties.length

  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-10 lg:py-14">
      <header>
        <h1 className="text-heading text-foreground">Propiedades</h1>
        <p aria-live="polite" className="mt-2 text-body-sm text-muted-foreground">
          {count} {count === 1 ? "propiedad" : "propiedades"}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SearchFilters filters={filters} zones={zones} />
        </aside>

        <div>
          {count > 0 ? (
            <PropertyGrid properties={properties} />
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
