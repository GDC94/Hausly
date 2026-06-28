import { describe, expect, it } from "vitest"
import type { PropertyFilters } from "@/shared/types"
import { buildPropertiesQuery } from "./build-properties-query"

// `end` = límite superior del slice acumulado `[0...$end]` ("Cargar más",
// specs/FILTERS.md §4). El builder lo recibe aparte de los filtros: no es faceta,
// es paginación.
const END = 24

describe("buildPropertiesQuery", () => {
  it("with no filters, every facet param is null so each predicate is a no-op", () => {
    const { params } = buildPropertiesQuery({}, END)
    expect(params).toEqual({
      types: null,
      zones: null,
      rooms: null,
      bathrooms: null,
      areaMin: null,
      areaMax: null,
      parking: null,
      conditions: null,
      amenities: null,
      q: null,
      operation: null,
      currency: null,
      priceMin: null,
      priceMax: null,
      end: END,
    })
  })

  it("returns the same static query regardless of filters or slice (TypeGen-friendly)", () => {
    const a = buildPropertiesQuery({}, 24)
    const b = buildPropertiesQuery({ rooms: 3, types: ["house"] }, 48)
    expect(a.query).toBe(b.query)
    expect(a.query).toContain('status == "available"')
    expect(a.query).toContain("order(_createdAt desc)")
  })

  it("maps every facet to its GROQ param", () => {
    const filters: PropertyFilters = {
      types: ["apartment", "ph"],
      zones: ["palermo"],
      rooms: 2,
      bathrooms: 1,
      areaMin: 40,
      areaMax: 120,
      parking: 1,
      conditions: ["brandNew"],
      amenities: ["pool", "grill"],
      q: "balcon",
    }
    expect(buildPropertiesQuery(filters, END).params).toEqual({
      types: ["apartment", "ph"],
      zones: ["palermo"],
      rooms: 2,
      bathrooms: 1,
      areaMin: 40,
      areaMax: 120,
      parking: 1,
      conditions: ["brandNew"],
      amenities: ["pool", "grill"],
      q: "balcon*",
      operation: null,
      currency: null,
      priceMin: null,
      priceMax: null,
      end: END,
    })
  })

  it("maps the price funnel onto the operations[] sub-filter params", () => {
    const { params } = buildPropertiesQuery(
      {
        operation: "sale",
        currency: "USD",
        priceMin: 100000,
        priceMax: 250000,
      },
      END,
    )
    expect(params.operation).toBe("sale")
    expect(params.currency).toBe("USD")
    expect(params.priceMin).toBe(100000)
    expect(params.priceMax).toBe(250000)
  })

  it("evaluates operation/currency/price on the SAME operations[] element", () => {
    const { query } = buildPropertiesQuery({}, END)
    // El sub-filtro vive DENTRO de un único count(operations[ ... ]) > 0 — los
    // cuatro predicados sobre el mismo elemento, nunca como predicados sueltos.
    expect(query).toMatch(
      /count\(operations\[[\s\S]*type == \$operation[\s\S]*price\.currency == \$currency[\s\S]*price\.amount >= \$priceMin[\s\S]*price\.amount <= \$priceMax[\s\S]*\]\) > 0/,
    )
  })

  it("applies a prefix wildcard to the text term (FILTERS §4, option A)", () => {
    expect(buildPropertiesQuery({ q: "pal" }, END).params.q).toBe("pal*")
  })

  it("keeps each predicate guarded by !defined so absent params don't filter", () => {
    const { query } = buildPropertiesQuery({}, END)
    expect(query).toContain("!defined($types) || propertyType in $types")
    expect(query).toContain("!defined($zones) || location.zone->slug.current in $zones")
    expect(query).toContain("!defined($rooms) || rooms >= $rooms")
    expect(query).toContain("!defined($bathrooms) || bathrooms >= $bathrooms")
    expect(query).toContain("!defined($areaMin) || coveredArea >= $areaMin")
    expect(query).toContain("!defined($areaMax) || coveredArea <= $areaMax")
    expect(query).toContain("!defined($parking) || parkingSpaces >= $parking")
    expect(query).toContain("!defined($conditions) || condition in $conditions")
    expect(query).toContain(
      "!defined($amenities) || count(amenities[@ in $amenities]) == count($amenities)",
    )
    expect(query).toContain(
      "!defined($q) || title match $q || code match $q || (location.showAddress == true && location.address match $q)",
    )
  })

  // --- Paginación "Cargar más" (specs/FILTERS.md §4/§5) ---

  it("exposes the slice end as a bound param", () => {
    expect(buildPropertiesQuery({}, 48).params.end).toBe(48)
  })

  it("returns a windowed page plus the unsliced total in one round-trip", () => {
    const { query } = buildPropertiesQuery({}, END)
    // Lote acumulado `[0...$end]` para los items + `count()` del set completo sin
    // slice: un solo fetch resuelve "qué mostrar" y "cuántas hay en total".
    expect(query).toContain("[0...$end]")
    expect(query).toMatch(/"items":/)
    expect(query).toMatch(/"total": count\(/)
  })
})
