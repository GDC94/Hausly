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
