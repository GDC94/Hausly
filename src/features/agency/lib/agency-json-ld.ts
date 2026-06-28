import type { SanityImageSource } from "@sanity/image-url"
import type { Place, RealEstateAgent, WithContext } from "schema-dts"

/**
 * JSON-LD global de la inmobiliaria (specs/SEO.md §4.2): el singleton `agency`
 * como entidad `RealEstateAgent` — NAP + `areaServed` (zonas) + `sameAs` (redes).
 *
 * Función **pura** (`agency → objeto schema.org`), sin tocar Sanity ni Next: el
 * resolver de imagen del logo se **inyecta** (`imageUrl`) para unit-testear el
 * shape sin prender el image-url builder (mismo criterio que `property-json-ld`).
 *
 * Coalesce: los datos del singleton de Sanity ganan; `fallback` (site.ts) cubre
 * mientras el documento real no exista todavía en el dataset (cero datos falsos
 * si el editor ya cargó la inmobiliaria, NAP estable si no).
 */

/** Forma mínima que el JSON-LD consume del singleton `agency`. */
export type AgencyData = {
  name?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  logo?: SanityImageSource | null
  socials?: { instagram?: string | null; facebook?: string | null } | null
} | null

export type AgencyJsonLdOptions = {
  /** URL absoluta del sitio (sin barra final). */
  siteUrl: string
  /** Zonas servidas → `areaServed`. Sólo se usa el `name`. */
  zones: Array<{ name?: string | null }>
  /** NAP de respaldo (site.ts) mientras el singleton no esté cargado. */
  fallback: {
    name: string
    phone: string
    email: string
    address: string
    socials: { instagram?: string | null; facebook?: string | null }
  }
  /** Resolver de imagen inyectado (la ruta pasa `urlFor(...).url()`). */
  imageUrl: (image: SanityImageSource) => string
}

// schema-dts tipa `RealEstateAgent` como `RealEstateAgentLeaf | string` (la rama
// string es la referencia por IRI). Se excluye para que el retorno sea el objeto
// y exponga sus props (`sameAs`, `areaServed`, …) sin castear en cada acceso.
export function buildAgencyJsonLd(
  agency: AgencyData,
  { siteUrl, zones, fallback, imageUrl }: AgencyJsonLdOptions,
): WithContext<Exclude<RealEstateAgent, string>> {
  // Coalesce a NIVEL SINGLETON, no por-campo: si el documento `agency` existe, TODO
  // el NAP sale de él y los campos en blanco se OMITEN (el schema sólo exige
  // `name`). El fallback de site.ts se usa únicamente cuando el singleton no existe
  // todavía. Así nunca se publica un teléfono/email/dirección placeholder junto a
  // una inmobiliaria real (datos falsos en el dato estructurado).
  const present = agency != null
  const name = agency?.name ?? fallback.name
  const telephone = present ? (agency?.phone ?? undefined) : fallback.phone
  const email = present ? (agency?.email ?? undefined) : fallback.email
  const address = present ? (agency?.address ?? undefined) : fallback.address

  const socials = present ? agency?.socials : fallback.socials
  const sameAs = [socials?.instagram, socials?.facebook].filter((url): url is string =>
    Boolean(url),
  )

  const logo = agency?.logo ? imageUrl(agency.logo) : undefined

  const areaServed = zones
    .map((zone) => zone.name)
    .filter((zoneName): zoneName is string => Boolean(zoneName))
    .map((zoneName): Place => ({ "@type": "Place", name: zoneName }))

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    // `@id` estable: ancla la entidad para que otros nodos (listings) la referencien.
    "@id": `${siteUrl}/#agency`,
    name,
    url: siteUrl,
    logo,
    image: logo,
    telephone,
    email,
    address: address
      ? { "@type": "PostalAddress", streetAddress: address, addressCountry: "AR" }
      : undefined,
    areaServed: areaServed.length > 0 ? areaServed : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}
