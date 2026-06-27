import { describe, expect, it } from "vitest"
import { formatPrice } from "./format-price"

describe("formatPrice", () => {
  it("prefixes the currency code and groups thousands with the AR separator (dot)", () => {
    expect(formatPrice(180000, "USD")).toBe("USD 180.000")
    expect(formatPrice(250000, "ARS")).toBe("ARS 250.000")
  })

  it("groups millions correctly", () => {
    expect(formatPrice(1250000, "USD")).toBe("USD 1.250.000")
  })

  it("renders no decimals (prices are whole amounts in this market)", () => {
    expect(formatPrice(180000.99, "USD")).toBe("USD 180.001")
    expect(formatPrice(1500, "ARS")).toBe("ARS 1.500")
  })

  it("handles zero without crashing", () => {
    expect(formatPrice(0, "USD")).toBe("USD 0")
  })

  it("returns a fallback when the amount is missing (schema lets it be absent in projections)", () => {
    expect(formatPrice(undefined, "USD")).toBe("Consultar")
    expect(formatPrice(null, "ARS")).toBe("Consultar")
  })
})
