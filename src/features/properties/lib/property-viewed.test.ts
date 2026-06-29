import { describe, expect, it } from "vitest"
import type { PropertyDetail } from "../types"
import { buildPropertyViewedProps } from "./property-viewed"

/** Fixture mínimo: sólo los campos que el helper lee, casteado al tipo completo. */
function property(overrides: Record<string, unknown>): PropertyDetail {
  return {
    _id: "p1",
    slug: "depto-palermo",
    operations: [{ type: "sale", price: { currency: "USD", amount: 180000 } }],
    location: { zone: { name: "Palermo", slug: "palermo" } },
    ...overrides,
  } as unknown as PropertyDetail
}

describe("buildPropertyViewedProps", () => {
  it("mapea id, zona (slug), operación y priceBucket de la primera operación", () => {
    expect(buildPropertyViewedProps(property({}))).toEqual({
      propertyId: "p1",
      zone: "palermo",
      operation: "sale",
      priceBucket: "USD:100k-200k",
    })
  })

  it("usa la PRIMERA operación cuando hay varias (venta + alquiler)", () => {
    const result = buildPropertyViewedProps(
      property({
        operations: [
          { type: "rent", price: { currency: "ARS", amount: 850000 } },
          { type: "sale", price: { currency: "USD", amount: 180000 } },
        ],
      }),
    )
    expect(result.operation).toBe("rent")
    expect(result.priceBucket).toBe("ARS:750k-1M")
  })

  it("nunca filtra PII ni el precio exacto: sólo bucket, zona e id (specs/ANALYTICS.md §1)", () => {
    const result = buildPropertyViewedProps(property({}))
    expect(JSON.stringify(result)).not.toContain("180000")
  })

  it("degrada a null/unknown cuando faltan zona u operaciones (proyección parcial)", () => {
    const result = buildPropertyViewedProps(property({ operations: [], location: { zone: null } }))
    expect(result).toEqual({
      propertyId: "p1",
      zone: null,
      operation: null,
      priceBucket: "unknown",
    })
  })
})
