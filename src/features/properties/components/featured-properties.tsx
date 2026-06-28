import Link from "next/link"
import type { PropertyCardData } from "../types"
import { PropertyGrid } from "./property-grid"

/**
 * Sección "destacadas" de la home (specs/LAYOUT.md §3): heading + grid de
 * `PropertyCard` (pin editorial vía flag `featured`) + link al listado completo.
 * Vive en `features/properties` —es su dominio— para no meter presentación de
 * propiedades en `app/` (AGENTS.md: `app/` solo orquesta).
 *
 * `priority={false}`: el grid va below-the-fold (bajo el hero) → no compite por
 * preload con los recursos above-the-fold (CWV). Si no hay destacadas, no
 * renderiza (cero ruido en la home).
 */
export function FeaturedProperties({ properties }: { properties: PropertyCardData[] }) {
  if (properties.length === 0) return null

  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-16 lg:py-20">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-heading text-foreground">Propiedades destacadas</h2>
        <Link
          href="/propiedades"
          className="text-body-sm text-link underline-offset-4 hover:underline"
        >
          Ver todas las propiedades
        </Link>
      </header>
      <div className="mt-8">
        <PropertyGrid properties={properties} priority={false} />
      </div>
    </section>
  )
}
