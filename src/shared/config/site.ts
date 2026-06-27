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
export function whatsappUrl(): string {
  const { whatsapp, whatsappMessage } = SITE.contact
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
}

export type SiteNavItem = (typeof SITE.nav)[number]
