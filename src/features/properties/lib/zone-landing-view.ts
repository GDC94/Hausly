import type { Metadata } from "next"

/**
 * Presentación de la landing por zona (issue #10, specs/LAYOUT.md §6, specs/SEO.md
 * §7). `app/` es **solo routing** (specs/ARCHITECTURE.md §4): la lógica SEO vive
 * en el feature y la ruta sólo la invoca.
 */

/** Forma mínima de zona que la landing necesita (proyección de `getZone`). */
export type ZoneLandingData = {
  name: string | null
  slug: string
  description: string | null
}

/**
 * Href al listado interactivo con la zona preseleccionada. La landing es estática
 * e indexable (canonical propio); cuando el usuario filtra o quiere paginar,
 * "sale" al listado `/propiedades?zone=…` — el eje de filtros libres por
 * `searchParams` que va `noindex` (specs/ARCHITECTURE.md §4). Así la landing no
 * depende de `searchParams` y se pre-genera 100% estática.
 */
export function buildZoneListingHref(slug: string): string {
  return `/propiedades?zone=${encodeURIComponent(slug)}`
}

/**
 * Path de la landing de la zona. Encode el slug: un slug con caracteres reservados
 * (espacio, `#`, …) emitiría una URL rota (fragmento/otro path) si se interpola
 * crudo. Único dueño del path → canonical y links comparten una sola forma.
 */
export function buildZonePath(slug: string): string {
  return `/propiedades/zona/${encodeURIComponent(slug)}`
}

/**
 * Metadata SEO local de la landing (specs/SEO.md §7): `title`/H1 geográfico,
 * **canonical auto-referente** a la propia zona (NO a `/propiedades`) e
 * **indexable** (es el eje finito de alto valor, a diferencia de las variantes
 * por `searchParams`). La meta description sale de la descripción cargada en
 * Sanity, recortada; si la zona no tiene texto, se deriva una geográfica del
 * nombre para no quedar sin description.
 */
export function buildZoneMetadata(zone: ZoneLandingData): Metadata {
  const heading = zoneHeading(zone.name)
  const description = zone.description
    ? truncate(zone.description, 155)
    : fallbackDescription(zone.name)

  return {
    title: heading,
    description,
    alternates: { canonical: buildZonePath(zone.slug) },
    openGraph: { type: "website", title: heading },
  }
}

/** "Propiedades en Palermo" — o un genérico si la zona no tiene nombre. */
export function zoneHeading(name: string | null): string {
  return name ? `Propiedades en ${name}` : "Propiedades por zona"
}

function fallbackDescription(name: string | null): string {
  const where = name ? `en ${name}` : "por zona"
  return `Casas, departamentos y más en venta y alquiler ${where}. Descubrí las propiedades disponibles ${where}.`
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}
