import type { Metadata } from "next"
import { FeaturedProperties, getFeaturedProperties } from "@/features/properties"
import { getZones, HomeSearch } from "@/features/search"
import { ContactCta, Hero, WhyUs } from "@/shared/ui/home"

// Home = portada / brand-first. `title.absolute` evita el template " | Hausly"
// (sería "Hausly | Hausly"); canonical "/" fija la raíz como URL indexable
// (specs/SEO.md §2). El resto de la metadata base (metadataBase, OG) la hereda
// del layout raíz.
export const metadata: Metadata = {
  title: { absolute: "Hausly — Propiedades en venta y alquiler en Argentina" },
  description:
    "Casas, departamentos y más en venta y alquiler en las mejores zonas. Encontrá tu próxima propiedad con Hausly.",
  alternates: { canonical: "/" },
}

// Portada híbrida (specs/LAYOUT.md §3). `app/` SOLO orquesta (AGENTS.md): fetchea
// y compone componentes de `features/*` + `shared/ui` — la presentación de cada
// sección vive fuera (Hero/WhyUs/ContactCta en `shared/ui/home`, FeaturedProperties
// en `features/properties`). Cacheada por tags (`['property','zone']`):
// publicar/destacar en Sanity revalida vía webhook (specs/ARCHITECTURE.md §4).
export default async function HomePage() {
  const [featured, zones] = await Promise.all([getFeaturedProperties(), getZones()])

  return (
    <>
      <Hero>
        <HomeSearch zones={zones} />
      </Hero>
      <FeaturedProperties properties={featured} />
      <WhyUs zonesCount={zones.length} />
      <ContactCta />
    </>
  )
}
