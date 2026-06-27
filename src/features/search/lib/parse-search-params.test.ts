import { describe, expect, it } from "vitest"
import { parseSearchParams } from "./parse-search-params"

describe("parseSearchParams", () => {
  it("returns an empty object when there are no params", () => {
    expect(parseSearchParams({})).toEqual({})
  })

  it("ignores unknown params (page always renders)", () => {
    expect(parseSearchParams({ foo: "bar", utm_source: "ig" })).toEqual({})
  })

  describe("enum facets (multi-value)", () => {
    it("parses a single value", () => {
      expect(parseSearchParams({ type: "apartment" })).toEqual({ types: ["apartment"] })
    })

    it("parses comma-separated values", () => {
      expect(parseSearchParams({ type: "apartment,ph" })).toEqual({
        types: ["apartment", "ph"],
      })
    })

    it("parses repeated keys delivered as an array", () => {
      expect(parseSearchParams({ type: ["apartment", "ph"] })).toEqual({
        types: ["apartment", "ph"],
      })
    })

    it("drops invalid enum values but keeps the valid ones", () => {
      expect(parseSearchParams({ type: "apartment,banana,ph" })).toEqual({
        types: ["apartment", "ph"],
      })
    })

    it("omits the facet entirely when every value is invalid", () => {
      expect(parseSearchParams({ type: "banana,kiwi" })).toEqual({})
    })

    it("parses condition and amenities", () => {
      expect(parseSearchParams({ condition: "brandNew,used", amenities: "pool,grill" })).toEqual({
        conditions: ["brandNew", "used"],
        amenities: ["pool", "grill"],
      })
    })
  })

  describe("zone (slug list, no enum validation)", () => {
    it("parses slugs as-is", () => {
      expect(parseSearchParams({ zone: "palermo,belgrano" })).toEqual({
        zones: ["palermo", "belgrano"],
      })
    })

    it("drops empty slugs", () => {
      expect(parseSearchParams({ zone: "palermo,, ,belgrano" })).toEqual({
        zones: ["palermo", "belgrano"],
      })
    })
  })

  describe("numeric facets (minimum)", () => {
    it("coerces a number", () => {
      expect(parseSearchParams({ rooms: "3" })).toEqual({ rooms: 3 })
    })

    it("normalizes the '4+' UI encoding to its minimum", () => {
      expect(parseSearchParams({ rooms: "4+" })).toEqual({ rooms: 4 })
    })

    it("drops non-numeric, zero and negative values", () => {
      expect(parseSearchParams({ rooms: "abc" })).toEqual({})
      expect(parseSearchParams({ rooms: "0" })).toEqual({})
      expect(parseSearchParams({ rooms: "-2" })).toEqual({})
    })

    it("parses bathrooms, parking and the area range", () => {
      expect(
        parseSearchParams({
          bathrooms: "2",
          parking: "1",
          areaMin: "50",
          areaMax: "120",
        }),
      ).toEqual({ bathrooms: 2, parking: 1, areaMin: 50, areaMax: 120 })
    })
  })

  describe("free text", () => {
    it("trims the term", () => {
      expect(parseSearchParams({ q: "  luminoso  " })).toEqual({ q: "luminoso" })
    })

    it("omits a blank term", () => {
      expect(parseSearchParams({ q: "   " })).toEqual({})
    })
  })

  it("parses a full combination", () => {
    expect(
      parseSearchParams({
        type: "apartment",
        zone: "palermo",
        rooms: "2",
        bathrooms: "1",
        areaMin: "40",
        amenities: "pool",
        q: "balcon",
      }),
    ).toEqual({
      types: ["apartment"],
      zones: ["palermo"],
      rooms: 2,
      bathrooms: 1,
      areaMin: 40,
      amenities: ["pool"],
      q: "balcon",
    })
  })
})
