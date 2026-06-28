import { describe, expect, it } from "vitest"
import { toPriceBucket } from "./price-bucket"

describe("toPriceBucket", () => {
  it("buckets an amount into a coarse range prefixed with the currency (never the exact price)", () => {
    // specs/ANALYTICS.md §4: priceBucket es un rango (ej. 100k-200k), nunca el
    // monto exacto cruzable con otros datos.
    expect(toPriceBucket(180000, "USD")).toBe("USD:100k-200k")
    expect(toPriceBucket(45000, "USD")).toBe("USD:0-50k")
  })

  it("treats the lower threshold as the start of the NEXT band (boundary inclusive on top)", () => {
    expect(toPriceBucket(50000, "USD")).toBe("USD:50k-100k")
    expect(toPriceBucket(100000, "USD")).toBe("USD:100k-200k")
  })

  it("scales to ARS millions with M notation", () => {
    expect(toPriceBucket(850000, "ARS")).toBe("ARS:750k-1M")
    expect(toPriceBucket(85000000, "ARS")).toBe("ARS:50M-100M")
  })

  it("caps the top band with a + (no exact ceiling leaked)", () => {
    expect(toPriceBucket(250000000, "USD")).toBe("USD:100M+")
  })

  it("returns 'unknown' when the amount is missing or non-positive (absent in projections)", () => {
    expect(toPriceBucket(undefined, "USD")).toBe("unknown")
    expect(toPriceBucket(null, "ARS")).toBe("unknown")
    expect(toPriceBucket(0, "USD")).toBe("unknown")
    expect(toPriceBucket(Number.NaN, "USD")).toBe("unknown")
  })
})
