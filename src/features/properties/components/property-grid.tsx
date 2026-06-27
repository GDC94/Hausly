import type { PropertyCardData } from "../types"
import { PropertyCard } from "./property-card"

/**
 * Grid editorial responsive (specs/LAYOUT.md §9): 1 col mobile → 2 col `md` →
 * 3 col `lg`. Las primeras cards llevan `priority` (above-the-fold → LCP).
 * Si no hay resultados, muestra un empty state — la página siempre renderiza.
 */
export function PropertyGrid({ properties }: { properties: PropertyCardData[] }) {
  if (properties.length === 0) {
    return <PropertyGridEmpty />
  }

  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <li key={property._id}>
          <PropertyCard property={property} priority={index < 3} />
        </li>
      ))}
    </ul>
  )
}

function PropertyGridEmpty() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-6 py-16 text-center">
      <p className="text-subheading text-foreground">No hay propiedades disponibles</p>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Estamos sumando nuevas propiedades. Volvé pronto o escribinos por WhatsApp.
      </p>
    </div>
  )
}
