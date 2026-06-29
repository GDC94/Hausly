import type { Metadata } from "next"
import { imageUrl } from "@/shared/sanity/image"
import type { GalleryImage } from "../components/property-gallery"
import type { PropertyDetail } from "../types"
import { buildPriceLine } from "./build-price-line"

/**
 * Presentación del detalle (specs/ARCHITECTURE.md §4: `app/` es **solo routing**,
 * cero lógica de negocio). Estos helpers viven en el feature — la ruta sólo los
 * invoca y compone.
 */

/** Metadata SEO del detalle (specs/SEO.md §2): canonical, OG, noindex si no `available`. */
export function buildPropertyMetadata(property: PropertyDetail): Metadata {
  const og = property.mainImage?.asset
    ? imageUrl(property.mainImage, { width: 1200, height: 630 })
    : undefined

  return {
    title: property.title ?? "Propiedad",
    description: buildMetaDescription(property),
    alternates: { canonical: `/propiedades/${property.slug}` },
    openGraph: {
      type: "website",
      title: property.title ?? undefined,
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image" },
    // No rankear lo que no se vende: sólo `available` es indexable.
    robots: property.status === "available" ? undefined : { index: false, follow: true },
  }
}

/**
 * Meta description del detalle. Usa la descripción real; si la propiedad no tiene
 * (`descriptionPlain` vacío), arma un **default derivado del contenido** —specs/SEO.md
 * §1 "smart defaults con override opcional"— a partir de specs + zona + precio. Así
 * nunca queda vacía (evita el `meta-description` faltante que detecta Lighthouse).
 */
function buildMetaDescription(property: PropertyDetail): string {
  const plain = property.descriptionPlain?.trim()
  if (plain) return truncate(plain, 155)

  const specs = buildSpecLine(property)
  const zone = property.location?.zone?.name
  const price = buildPriceLine(property.operations)
  const head = [specs, zone ? `en ${zone}` : null].filter(Boolean).join(" ")
  const body = [head, price !== "Consultar precio" ? price : null].filter(Boolean).join(". ")
  const composed = body
    ? `${body}. Consultá disponibilidad, precio y fotos en Hausly.`
    : `${property.title ?? "Propiedad"}: consultá disponibilidad, precio y fotos en Hausly.`
  return truncate(composed, 155)
}

/** Resuelve main + galería a URLs servibles (cero `urlFor` en el cliente). */
export function resolveGalleryImages(property: PropertyDetail): GalleryImage[] {
  const sources = [property.mainImage, ...(property.gallery ?? [])].filter(
    (image): image is NonNullable<typeof image> => Boolean(image?.asset),
  )
  return sources.map((image) => ({
    url: imageUrl(image, { width: 1600 }),
    alt: image.alt ?? property.title ?? "Foto de la propiedad",
    lqip: image.lqip ?? null,
  }))
}

/**
 * Mensaje pre-cargado de la consulta por una propiedad (WhatsApp + `LeadForm`).
 * Vive en el feature `properties` (es presentación del detalle); la página lo pasa
 * al `LeadForm` del feature `leads` para no acoplar un feature con otro
 * (specs/ARCHITECTURE.md §3: el feature no importa de otro, `app/` compone).
 */
export function buildContactMessage(property: PropertyDetail): string {
  const code = property.code ? ` (${property.code})` : ""
  return `Hola Hausly, me interesa "${property.title ?? "esta propiedad"}"${code}. ¿Me pasás más información?`
}

/** "3 amb · 2 baños · 85 m²" — omite ausentes (mismo criterio que la card, §4). */
export function buildSpecLine({ rooms, bathrooms, coveredArea }: PropertyDetail): string {
  const parts: string[] = []
  if (rooms) parts.push(`${rooms} amb`)
  if (bathrooms) parts.push(`${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}`)
  if (coveredArea) parts.push(`${coveredArea} m²`)
  return parts.join(" · ")
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}
