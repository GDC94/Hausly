import type { SanityImageSource } from "@sanity/image-url"
import imageUrlBuilder from "@sanity/image-url"
import { getSanityEnv } from "./env"

const { projectId, dataset } = getSanityEnv()
const builder = imageUrlBuilder({ projectId, dataset })

/** Construye URLs de imágenes de Sanity (hotspot/crop-aware). El patrón de render
 *  anti-deformación vive en specs/DESIGN §9; esto es solo el builder de URLs. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

/**
 * URL lista para usar. Con `height` recorta hotspot-aware al rectángulo exacto
 * (OG, thumbnails); sin `height` ajusta al ancho conservando proporción (hero,
 * galería). Centraliza el `.fit()` en un solo lugar.
 */
export function imageUrl(
  source: SanityImageSource,
  { width, height }: { width: number; height?: number },
): string {
  const base = urlFor(source).width(width)
  // biome-ignore lint/suspicious/noFocusedTests: `.fit()` es el builder de @sanity/image-url, no un test focalizado.
  const sized = height ? base.height(height).fit("crop") : base.fit("max")
  return sized.auto("format").url()
}
