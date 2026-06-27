import type { Metadata } from "next"
import { getProperties, PropertyGrid } from "@/features/properties"

export const metadata: Metadata = {
  title: "Propiedades",
  description: "Casas, departamentos y más en venta y alquiler en las mejores zonas.",
}

// Listado cacheado por tags (`['property']`): publicar en Sanity revalida vía
// webhook, no por TTL (specs/ARCHITECTURE.md §4). La página sólo orquesta: lee la
// query y compone los componentes del feature (specs/ARCHITECTURE.md §2).
export default async function PropertiesPage() {
  const properties = await getProperties()
  const count = properties.length

  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-10 lg:py-14">
      <header>
        <h1 className="text-heading text-foreground">Propiedades</h1>
        <p aria-live="polite" className="mt-2 text-body-sm text-muted-foreground">
          {count} {count === 1 ? "propiedad" : "propiedades"}
        </p>
      </header>

      <div className="mt-8">
        <PropertyGrid properties={properties} />
      </div>
    </section>
  )
}
