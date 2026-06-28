import { describe, expect, it } from "vitest"
import { parseOffset } from "./parse-pagination"

describe("parseOffset", () => {
  it("defaults to 0 when the param is absent (first batch)", () => {
    expect(parseOffset(undefined)).toBe(0)
  })

  it("reads a positive integer", () => {
    expect(parseOffset("24")).toBe(24)
  })

  it("floors a positive decimal (offset is a whole count of items)", () => {
    expect(parseOffset("24.9")).toBe(24)
  })

  it("falls back to 0 on NaN, negative or zero (tolerant, never breaks render)", () => {
    expect(parseOffset("abc")).toBe(0)
    expect(parseOffset("-10")).toBe(0)
    expect(parseOffset("0")).toBe(0)
  })

  it("takes the first value when the key is repeated", () => {
    expect(parseOffset(["24", "48"])).toBe(24)
  })
})
