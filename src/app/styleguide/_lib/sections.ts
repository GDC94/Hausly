import type { ReactNode } from "react"
import { ChromeSection } from "../_sections/chrome"
import { DetailSection } from "../_sections/detail"
import { FormsSection } from "../_sections/forms"
import { HomeSection } from "../_sections/home"
import { PrimitivesSection } from "../_sections/primitives"
import { PropertyCardSection } from "../_sections/property-card"

/** Componente de sección — puede ser RSC async (las que fetchean data real). */
export type SectionSpecimen = () => ReactNode | Promise<ReactNode>

export type Section = {
  key: string
  title: string
  description: string
  Specimen: SectionSpecimen
}

/**
 * Registro de secciones del laboratorio `/styleguide` (specs/STYLEGUIDE.md §3): **fuente
 * única** que alimenta el índice, los `generateStaticParams` del `[section]` y el
 * despacho de renderizado. Un archivo por sección (`_sections/{key}.tsx`); este registro
 * mapea `key → Specimen`. El `[section]/page.tsx` es sólo un dispatcher.
 */
export const SECTIONS: Section[] = [
  {
    key: "primitives",
    title: "Primitivos",
    description:
      "Átomos del design system: Button, Input, Textarea, Select, Label, Field e íconos.",
    Specimen: PrimitivesSection,
  },
  {
    key: "property-card",
    title: "Property Card",
    description: "PropertyCard, PropertyImage, PropertyGrid, FeaturedProperties, LoadMore.",
    Specimen: PropertyCardSection,
  },
  {
    key: "detail",
    title: "Detalle",
    description: "Galería, features, amenities, descripción, ubicación y contact card del detalle.",
    Specimen: DetailSection,
  },
  {
    key: "forms",
    title: "Formularios",
    description: "LeadForm (idle/error/éxito), SearchFilters y PriceFunnel.",
    Specimen: FormsSection,
  },
  {
    key: "home",
    title: "Home",
    description: "Hero, WhyUs, ContactCta y HomeSearch.",
    Specimen: HomeSection,
  },
  {
    key: "chrome",
    title: "Chrome",
    description: "SiteHeader, HeaderNav y SiteFooter en marco contenido.",
    Specimen: ChromeSection,
  },
]

/** Busca una sección por `key`; `undefined` si no existe (el dispatcher hace `notFound()`). */
export function getSection(key: string): Section | undefined {
  return SECTIONS.find((section) => section.key === key)
}
