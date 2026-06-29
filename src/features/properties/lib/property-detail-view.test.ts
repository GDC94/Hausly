import { describe, expect, it, vi } from "vitest"
import type { PropertyQueryResult } from "@/shared/sanity/sanity.types"

// `property-detail-view` importa `imageUrl`, que al cargar valida el env de Sanity
// (ausente en test). Lo stubeamos: estos casos no ejercitan imágenes (mainImage null).
vi.mock("@/shared/sanity/image", () => ({ imageUrl: () => "https://cdn.test/img.jpg" }))

import { buildPropertyMetadata } from "./property-detail-view"

type Property = NonNullable<PropertyQueryResult>

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    _id: "p1",
    _createdAt: "2026-01-03T00:00:00Z",
    _updatedAt: "2026-02-01T00:00:00Z",
    title: "Casa 4 ambientes con jardín en Belgrano",
    code: "BEL-001",
    slug: "casa-4-ambientes-jardin-belgrano",
    propertyType: "house",
    status: "available",
    operations: [{ type: "sale", price: { _type: "price", amount: 320000, currency: "USD" } }],
    description: null,
    descriptionPlain: "",
    location: {
      address: "Cabildo 1234",
      showAddress: true,
      geopoint: { _type: "geopoint", lat: -34.56, lng: -58.45 },
      zone: { name: "Belgrano", slug: "belgrano" },
    },
    bedrooms: 3,
    bathrooms: 2,
    rooms: 4,
    coveredArea: 140,
    totalArea: 180,
    parkingSpaces: 1,
    age: 10,
    condition: "used",
    maintenanceFee: null,
    amenities: null,
    mainImage: null,
    gallery: null,
    ...overrides,
  }
}

describe("buildPropertyMetadata — description", () => {
  it("usa la descripción real cuando existe", () => {
    const meta = buildPropertyMetadata(
      makeProperty({ descriptionPlain: "Hermosa casa con jardín y parrilla." }),
    )
    expect(meta.description).toBe("Hermosa casa con jardín y parrilla.")
  })

  it("sin descripción, deriva un default del contenido (specs + zona + precio)", () => {
    const meta = buildPropertyMetadata(makeProperty({ descriptionPlain: "" }))
    // Nunca vacía (evita el meta-description faltante que marca Lighthouse).
    expect(meta.description).toBeTruthy()
    expect(meta.description).toContain("140 m²")
    expect(meta.description).toContain("Belgrano")
    expect(meta.description).toContain("USD")
  })

  it("sin descripción ni datos, cae a un default genérico no vacío", () => {
    const bare = makeProperty({
      descriptionPlain: "",
      rooms: null,
      bathrooms: null,
      coveredArea: null,
      operations: null,
      location: null,
    })
    expect(buildPropertyMetadata(bare).description).toBeTruthy()
  })

  it("trunca la descripción a 155 caracteres", () => {
    const long = "a".repeat(400)
    const meta = buildPropertyMetadata(makeProperty({ descriptionPlain: long }))
    expect((meta.description ?? "").length).toBeLessThanOrEqual(155)
  })
})
