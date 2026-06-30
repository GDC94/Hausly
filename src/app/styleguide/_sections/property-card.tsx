import {
  FeaturedProperties,
  getFeaturedProperties,
  getProperties,
  LoadMore,
  PropertyCard,
  PropertyGrid,
} from "@/features/properties"
import { Specimen } from "../_components/specimen"
import { emptyGrid, withLongTitle, withoutImage } from "../_lib/derive"

/**
 * Sección `property-card` (specs/STYLEGUIDE.md §5): tarjetas y grilla con data real +
 * estados borde DERIVADOS en memoria (batch 1). `PropertyImage` se exhibe dentro de
 * `PropertyCard` (su padre); el estado sin-imagen sale de `withoutImage`.
 */
export async function PropertyCardSection() {
  const [{ items }, featured] = await Promise.all([getProperties(), getFeaturedProperties()])
  const sample = items[0]

  return (
    <div className="flex flex-col gap-10">
      {sample ? (
        <section className="flex flex-col gap-4">
          <h3 className="text-body font-semibold text-foreground">PropertyCard</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Specimen label="PropertyCard · data real">
              <PropertyCard property={sample} />
            </Specimen>
            <Specimen label="PropertyCard · sin imagen">
              <PropertyCard property={withoutImage(sample)} />
            </Specimen>
            <Specimen label="PropertyCard · título largo">
              <PropertyCard property={withLongTitle(sample)} />
            </Specimen>
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">PropertyGrid</h3>
        <Specimen label="PropertyGrid · con resultados">
          <PropertyGrid properties={items} />
        </Specimen>
        <Specimen label="PropertyGrid · vacío">
          <PropertyGrid properties={emptyGrid()} />
        </Specimen>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">FeaturedProperties</h3>
        <Specimen label="FeaturedProperties · data real">
          <FeaturedProperties properties={featured} />
        </Specimen>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">LoadMore</h3>
        <Specimen label="LoadMore · enlace crawlable">
          <LoadMore href="/propiedades?offset=12" />
        </Specimen>
      </section>
    </div>
  )
}
