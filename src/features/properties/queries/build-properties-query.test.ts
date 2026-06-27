import { describe, expect, it } from "vitest"
import type { PropertyFilters } from "@/shared/types"
import { buildPropertiesQuery } from "./build-properties-query"

describe("buildPropertiesQuery", () => {
  it("with no filters, every param is null so each predicate is a no-op", () => {
    const { params } = buildPropertiesQuery({})
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
    })
  })

  it("returns the same static query regardless of filters (TypeGen-friendly)", () => {
    const a = buildPropertiesQuery({})
    const b = buildPropertiesQuery({ rooms: 3, types: ["house"] })
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
    expect(buildPropertiesQuery(filters).params).toEqual({
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
    })
  })

  it("applies a prefix wildcard to the text term (FILTERS §4, option A)", () => {
    expect(buildPropertiesQuery({ q: "pal" }).params.q).toBe("pal*")
  })

  it("keeps each predicate guarded by !defined so absent params don't filter", () => {
    const { query } = buildPropertiesQuery({})
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
      "!defined($q) || title match $q || code match $q || location.address match $q",
    )
  })
})
