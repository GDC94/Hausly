/**
 * Configuración estática del sitio — chrome (Header + Footer).
 *
 * Fuente única LOCAL del NAP/branding mientras no se cablea el singleton
 * `agency` de Sanity (issue posterior). Cuando se cablee, estos valores se
 * reemplazan por el fetch del `agency` y este archivo queda como fallback.
 * Ver specs/LAYOUT.md §2 y specs/SANITY-SCHEMA.md (`agency`).
 *
 * Datos de contacto = placeholders hasta tener la inmobiliaria real.
 */
export const SITE = {
  name: "Hausly",
  /** Navegación principal (header + columna del footer). URLs en español por SEO/mercado AR. */
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Propiedades", href: "/propiedades" },
    { label: "Contacto", href: "/contacto" },
  ],
  /** CTA del header. */
  cta: { label: "Contactar", href: "/contacto" },
  /** NAP de la inmobiliaria (placeholder). */
  contact: {
    phone: "+54 11 5555-1234",
    phoneHref: "tel:+541155551234",
    email: "hola@hausly.com.ar",
    address: "Av. del Libertador 1234, CABA, Argentina",
    /** Número en formato wa.me (solo dígitos, con código de país). */
    whatsapp: "5491155551234",
    whatsappMessage: "Hola Hausly, quiero más información sobre una propiedad.",
  },
  /** Reseñas Google Business Profile (SEO local). */
  reviewsUrl: "https://www.google.com/maps",
  socials: {
    instagram: "https://instagram.com/hausly",
    facebook: "https://facebook.com/hausly",
  },
} as const

/** URL de WhatsApp con mensaje prellenado (canal de leads, specs/STACK.md). */
export function whatsappUrl(message: string = SITE.contact.whatsappMessage): string {
  return `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(message)}`
}

/**
 * URL absoluta canónica del sitio. Obligatoria para `metadataBase`, los
 * `canonical` y el `url`/`@id` del JSON-LD (specs/SEO.md §2, §4): sin base
 * absoluta Next no resuelve canonical/OG y los validadores de datos
 * estructurados rechazan URLs relativas.
 *
 * Resolución: env explícita → dominio de producción de Vercel → localhost. El
 * fallback mantiene el build verde aunque la env no esté seteada todavía.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, "")

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`

  return "http://localhost:3000"
}

/** Nombre de marca para metadata (title template) y JSON-LD. */
export const SITE_NAME = SITE.name

export type SiteNavItem = (typeof SITE.nav)[number]
