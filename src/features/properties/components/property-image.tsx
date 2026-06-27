import type { SanityImageSource } from "@sanity/image-url"
import Image from "next/image"
import { urlFor } from "@/shared/sanity/image"
import type { PropertyCardData } from "../types"

type PropertyImageData = PropertyCardData["mainImage"]

/**
 * Patrón canónico anti-deformación (specs/DESIGN.md §9): contenedor con
 * `aspect-ratio` fijo (token `--aspect-card`, 4/3) + `<Image fill>` +
 * `object-cover`. El contenedor manda la forma; la imagen mantiene su proporción
 * y recorta parejo respetando el hotspot/crop de Sanity. Nunca se estira.
 */
export function PropertyImage({
  image,
  title,
  sizes,
  priority = false,
}: {
  image: PropertyImageData
  title: string
  sizes: string
  priority?: boolean
}) {
  if (!image?.asset) {
    return <div className="aspect-card overflow-hidden rounded-lg bg-muted" aria-hidden="true" />
  }

  const url = urlFor(image as SanityImageSource)
    .width(800)
    .height(600)
    // biome-ignore lint/suspicious/noFocusedTests: `.fit()` es el builder de @sanity/image-url (recorte hotspot-aware), no un test focalizado.
    .fit("crop")
    .auto("format")
    .url()

  return (
    <div className="relative aspect-card overflow-hidden rounded-lg bg-muted">
      <Image
        src={url}
        alt={image.alt ?? title}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-(--duration) ease-(--ease-out-expo) group-hover:scale-[1.03]"
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip ?? undefined}
        priority={priority}
      />
    </div>
  )
}
