import { describe, expect, it } from "vitest"
import type { PropertyCardData } from "../types"
import { buildPriceLine } from "./build-price-line"

type Operations = PropertyCardData["operations"]

const ops = (value: Operations): Operations => value

describe("buildPriceLine", () => {
  it("shows a single operation's price with no type prefix", () => {
    const operations = ops([
      { type: "sale", price: { _type: "price", amount: 180000, currency: "USD" } },
    ])
    expect(buildPriceLine(operations)).toBe("USD 180.000")
  })

  it("shows each operation in its own currency with a type prefix (no conversion)", () => {
    const operations = ops([
      { type: "sale", price: { _type: "price", amount: 180000, currency: "USD" } },
      { type: "rent", price: { _type: "price", amount: 250000, currency: "ARS" } },
    ])
    expect(buildPriceLine(operations)).toBe("Venta USD 180.000 · Alquiler ARS 250.000")
  })

  it("falls back when there are no operations", () => {
    expect(buildPriceLine([])).toBe("Consultar precio")
    expect(buildPriceLine(null)).toBe("Consultar precio")
  })

  it("falls back to 'Consultar' for an operation with a missing amount", () => {
    const operations = ops([{ type: "sale", price: { _type: "price", currency: "USD" } }])
    expect(buildPriceLine(operations)).toBe("Consultar")
  })
})
