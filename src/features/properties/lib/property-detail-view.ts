import type { Metadata } from "next"
import { imageUrl } from "@/shared/sanity/image"
import type { GalleryImage } from "../components/property-gallery"
import type { PropertyDetail } from "../types"

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
    // `descriptionPlain` puede venir vacío/`null` (propiedad sin descripción):
    // se coalesce antes de truncar para no romper la generación de metadata.
    description: truncate(property.descriptionPlain ?? "", 155),
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
