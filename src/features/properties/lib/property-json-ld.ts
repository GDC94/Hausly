import type { SanityImageSource } from "@sanity/image-url"
import type { BreadcrumbList, ListItem, Offer, RealEstateListing, WithContext } from "schema-dts"
import type { PropertyQueryResult } from "@/shared/sanity/sanity.types"

type Property = NonNullable<PropertyQueryResult>
type Operation = NonNullable<Property["operations"]>[number]

/**
 * JSON-LD del detalle de propiedad (specs/SEO.md §4). Funciones **puras** —
 * `property → objeto schema.org` — sin tocar Sanity ni Next: el resolver de
 * imagen se **inyecta** (`imageUrl`) para poder unit-testear el shape sin prender
 * el image-url builder (mismo criterio que el ensamblado GROQ del #7). La ruta
 * pasa `urlFor(...)`; los tests pasan un fake.
 */

/** GoodRelations: venta = `Sell`, alquiler (común o temporario) = `LeaseOut`. */
const BUSINESS_FUNCTION: Record<NonNullable<Operation["type"]>, string> = {
  sale: "http://purl.org/goodrelations/v1#Sell",
  rent: "http://purl.org/goodrelations/v1#LeaseOut",
  temporaryRent: "http://purl.org/goodrelations/v1#LeaseOut",
}

/** `status` del schema → `ItemAvailability` de schema.org. */
const AVAILABILITY: Record<NonNullable<Property["status"]>, string> = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
  rented: "https://schema.org/OutOfStock",
}

/**
 * `propertyType` → `@type` de schema.org para el `itemOffered`. Lo residencial
 * mapea a tipos `Accommodation` concretos; el resto cae al `Accommodation`
 * genérico (sigue siendo válido y describe "unidad ofrecida").
 */
const ITEM_TYPE: Record<NonNullable<Property["propertyType"]>, string> = {
  apartment: "Apartment",
  house: "House",
  ph: "House",
  land: "Accommodation",
  commercial: "Accommodation",
  office: "Accommodation",
  warehouse: "Accommodation",
  garage: "Accommodation",
  farm: "Accommodation",
}

export type PropertyJsonLdOptions = {
  /** URL absoluta del sitio (sin barra final). */
  siteUrl: string
  /** Resolver de imagen inyectado (la ruta pasa `urlFor`). */
  imageUrl: (image: SanityImageSource) => string
}

export function buildPropertyListingJsonLd(
  property: Property,
  { siteUrl, imageUrl }: PropertyJsonLdOptions,
): WithContext<RealEstateListing> {
  const url = `${siteUrl}/propiedades/${property.slug}`
  const images = collectImages(property).map(imageUrl)
  const itemOffered = buildAccommodation(property)
  const availability = property.status ? AVAILABILITY[property.status] : undefined

  // Una Offer por operación (resuelve el caso doble-operación: venta-USD +
  // alquiler-ARS = dos Offers con moneda y businessFunction propios).
  const offers = (property.operations ?? [])
    .filter((op) => op.type && op.price?.amount != null && op.price.currency)
    // schema-dts tipa businessFunction/availability/itemOffered con uniones
    // cerradas que no incluyen las URLs de GoodRelations ni Accommodation, todas
    // válidas para Google en un RealEstateListing → se arma plano y se castea.
    .map(
      (op) =>
        ({
          "@type": "Offer",
          price: op.price?.amount,
          priceCurrency: op.price?.currency ?? undefined,
          businessFunction: op.type ? BUSINESS_FUNCTION[op.type] : undefined,
          availability,
          itemOffered,
        }) as unknown as Offer,
    )

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title ?? undefined,
    url,
    datePosted: property._createdAt,
    description: property.descriptionPlain || undefined,
    image: images.length > 0 ? images : undefined,
    offers: offers.length > 0 ? offers : undefined,
  }
}

/** `itemOffered`: la unidad física (Accommodation) con metros, ambientes y ubicación. */
function buildAccommodation(property: Property): Record<string, unknown> {
  const type = property.propertyType ? ITEM_TYPE[property.propertyType] : "Accommodation"
  const showAddress = property.location?.showAddress === true

  const accommodation: Record<string, unknown> = {
    "@type": type,
    name: property.title ?? undefined,
    numberOfBedrooms: property.bedrooms ?? undefined,
    numberOfBathroomsTotal: property.bathrooms ?? undefined,
    numberOfRooms: property.rooms ?? undefined,
    address: buildAddress(property, showAddress),
  }

  if (property.coveredArea != null) {
    accommodation.floorSize = {
      "@type": "QuantitativeValue",
      value: property.coveredArea,
      unitCode: "MTK", // UN/CEFACT: metro cuadrado
      unitText: "m²",
    }
  }

  // geo expone la ubicación EXACTA → sólo si la dirección es pública (privacidad,
  // specs/SANITY-SCHEMA.md §4). Sin el gate sería un oráculo de ubicación.
  const geo = property.location?.geopoint
  if (showAddress && geo?.lat != null && geo.lng != null) {
    accommodation.geo = { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng }
  }

  return accommodation
}

/** `PostalAddress`: la zona (pública) siempre; la calle sólo si `showAddress`. */
function buildAddress(property: Property, showAddress: boolean): Record<string, unknown> {
  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
    addressCountry: "AR",
    addressLocality: property.location?.zone?.name ?? undefined,
  }
  if (showAddress && property.location?.address) {
    address.streetAddress = property.location.address
  }
  return address
}

function collectImages(property: Property): SanityImageSource[] {
  const images: SanityImageSource[] = []
  if (property.mainImage?.asset) images.push(property.mainImage as SanityImageSource)
  for (const image of property.gallery ?? []) {
    if (image.asset) images.push(image as SanityImageSource)
  }
  return images
}

/**
 * `BreadcrumbList`: Inicio › Propiedades › [Zona] › [Propiedad] (specs/SEO.md
 * §4.3). El nivel de zona se omite si la propiedad no tiene zona.
 */
export function buildBreadcrumbJsonLd(
  property: Property,
  siteUrl: string,
): WithContext<BreadcrumbList> {
  const crumbs: Array<{ name: string; item: string }> = [
    { name: "Inicio", item: `${siteUrl}/` },
    { name: "Propiedades", item: `${siteUrl}/propiedades` },
  ]

  const zone = property.location?.zone
  if (zone?.name && zone.slug) {
    // Landing por zona (issue #10, URL real e indexable, specs/SEO.md §7): el
    // breadcrumb apunta a la página propia /propiedades/zona/[slug], no al
    // listado filtrado por querystring (que es `noindex`).
    crumbs.push({ name: zone.name, item: `${siteUrl}/propiedades/zona/${zone.slug}` })
  }

  crumbs.push({
    name: property.title ?? "Propiedad",
    item: `${siteUrl}/propiedades/${property.slug}`,
  })

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(
      (crumb, index): ListItem => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      }),
    ),
  }
}
