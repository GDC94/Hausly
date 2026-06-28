import { describe, expect, it } from "vitest"
import type { PropertyQueryResult } from "@/shared/sanity/sanity.types"
import { buildBreadcrumbJsonLd, buildPropertyListingJsonLd } from "./property-json-ld"

type Property = NonNullable<PropertyQueryResult>

const SITE = "https://hausly.test"

// Propiedad con DOS operaciones simultáneas (venta-USD + alquiler-ARS): el caso
// que prueba que cada operación genera SU Offer, sin cruzar moneda/función.
function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    _id: "p1",
    _createdAt: "2026-01-03T00:00:00Z",
    _updatedAt: "2026-02-01T00:00:00Z",
    title: "Dúplex en Palermo",
    code: "PAL-001",
    slug: "duplex-en-palermo",
    propertyType: "apartment",
    status: "available",
    operations: [
      { type: "sale", price: { _type: "price", amount: 300000, currency: "USD" } },
      { type: "rent", price: { _type: "price", amount: 500000, currency: "ARS" } },
    ],
    description: null,
    descriptionPlain: "Hermoso dúplex con balcón.",
    location: {
      address: "Gurruchaga 1234",
      showAddress: true,
      geopoint: { _type: "geopoint", lat: -34.58, lng: -58.43 },
      zone: { name: "Palermo", slug: "palermo" },
    },
    bedrooms: 2,
    bathrooms: 2,
    rooms: 3,
    coveredArea: 85,
    totalArea: 95,
    parkingSpaces: 1,
    age: 5,
    condition: "used",
    maintenanceFee: null,
    amenities: ["pool"],
    mainImage: null,
    gallery: null,
    ...overrides,
  }
}

const opts = { siteUrl: SITE, imageUrl: () => "https://cdn.test/img.jpg" }

describe("buildPropertyListingJsonLd", () => {
  it("is a RealEstateListing with the core page fields", () => {
    const ld = buildPropertyListingJsonLd(makeProperty(), opts)
    expect(ld["@context"]).toBe("https://schema.org")
    expect(ld["@type"]).toBe("RealEstateListing")
    expect(ld.name).toBe("Dúplex en Palermo")
    expect(ld.url).toBe(`${SITE}/propiedades/duplex-en-palermo`)
    expect(ld.datePosted).toBe("2026-01-03T00:00:00Z")
    expect(ld.description).toBe("Hermoso dúplex con balcón.")
  })

  it("emits ONE Offer per operation, each with its own currency and businessFunction", () => {
    const ld = buildPropertyListingJsonLd(makeProperty(), opts)
    const offers = asArray(ld.offers)
    expect(offers).toHaveLength(2)

    const sale = offers.find((o) => o.priceCurrency === "USD")
    const rent = offers.find((o) => o.priceCurrency === "ARS")
    expect(sale?.price).toBe(300000)
    expect(sale?.businessFunction).toBe("http://purl.org/goodrelations/v1#Sell")
    expect(rent?.price).toBe(500000)
    expect(rent?.businessFunction).toBe("http://purl.org/goodrelations/v1#LeaseOut")
  })

  it("maps status to schema.org availability on every offer", () => {
    const ld = buildPropertyListingJsonLd(makeProperty({ status: "sold" }), opts)
    for (const offer of asArray(ld.offers)) {
      expect(offer.availability).toBe("https://schema.org/SoldOut")
    }
  })

  it("maps propertyType to the itemOffered @type with floor size and rooms", () => {
    const ld = buildPropertyListingJsonLd(makeProperty(), opts)
    const item = asArray(ld.offers)[0]?.itemOffered as Record<string, unknown>
    expect(item["@type"]).toBe("Apartment")
    expect(item.numberOfBedrooms).toBe(2)
    expect(item.numberOfBathroomsTotal).toBe(2)
    expect(item.floorSize).toMatchObject({
      "@type": "QuantitativeValue",
      value: 85,
      unitCode: "MTK",
    })
  })

  it("includes street address and geo ONLY when showAddress is true (privacy)", () => {
    const shown = buildPropertyListingJsonLd(makeProperty(), opts)
    const shownItem = asArray(shown.offers)[0]?.itemOffered as Record<string, unknown>
    expect(shownItem).toMatchObject({
      address: { streetAddress: "Gurruchaga 1234" },
      geo: { "@type": "GeoCoordinates", latitude: -34.58, longitude: -58.43 },
    })

    const hidden = buildPropertyListingJsonLd(
      makeProperty({
        location: {
          address: "Gurruchaga 1234",
          showAddress: false,
          geopoint: { _type: "geopoint", lat: -34.58, lng: -58.43 },
          zone: { name: "Palermo", slug: "palermo" },
        },
      }),
      opts,
    )
    const hiddenItem = asArray(hidden.offers)[0]?.itemOffered as Record<string, unknown>
    expect(hiddenItem).toMatchObject({ address: { addressLocality: "Palermo" } }) // la zona sí (pública)
    expect(hiddenItem.address).not.toHaveProperty("streetAddress")
    expect(hiddenItem).not.toHaveProperty("geo")
  })

  it("collects main image + gallery into image[] via the injected resolver", () => {
    const ld = buildPropertyListingJsonLd(
      makeProperty({
        mainImage: {
          _type: "image",
          asset: { _ref: "image-main", _type: "reference" },
          lqip: null,
        },
        gallery: [
          { _type: "image", _key: "a", asset: { _ref: "image-a", _type: "reference" }, lqip: null },
        ],
      }),
      {
        siteUrl: SITE,
        imageUrl: (img) => `https://cdn.test/${(img as { _key?: string })._key ?? "main"}.jpg`,
      },
    )
    expect(ld.image).toEqual(["https://cdn.test/main.jpg", "https://cdn.test/a.jpg"])
  })

  it("omits image[] when there are no images", () => {
    const ld = buildPropertyListingJsonLd(makeProperty(), opts)
    expect(ld.image).toBeUndefined()
  })
})

describe("buildBreadcrumbJsonLd", () => {
  it("builds Inicio › Propiedades › Zona › Propiedad with absolute URLs", () => {
    const ld = buildBreadcrumbJsonLd(makeProperty(), SITE)
    expect(ld["@type"]).toBe("BreadcrumbList")
    const items = ld.itemListElement as unknown as Array<Record<string, unknown>>
    expect(items.map((i) => i.name)).toEqual([
      "Inicio",
      "Propiedades",
      "Palermo",
      "Dúplex en Palermo",
    ])
    expect(items[0].item).toBe(`${SITE}/`)
    expect(items[1].item).toBe(`${SITE}/propiedades`)
    expect(items[2].item).toBe(`${SITE}/propiedades/zona/palermo`)
    expect(items.map((i) => i.position)).toEqual([1, 2, 3, 4])
  })

  it("drops the zone level when the property has no zone", () => {
    const ld = buildBreadcrumbJsonLd(
      makeProperty({ location: { address: null, showAddress: null, geopoint: null, zone: null } }),
      SITE,
    )
    const items = ld.itemListElement as unknown as Array<Record<string, unknown>>
    expect(items.map((i) => i.name)).toEqual(["Inicio", "Propiedades", "Dúplex en Palermo"])
  })
})

// schema-dts tipa `offers` como `Offer | Offer[] | ...`; en los tests siempre
// generamos un array, este helper lo normaliza para poder mapear/contar.
function asArray(offers: unknown): Array<Record<string, unknown>> {
  return (Array.isArray(offers) ? offers : [offers]) as Array<Record<string, unknown>>
}
