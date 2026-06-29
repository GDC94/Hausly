import { describe, expect, it } from "vitest"

import type { PropertyCardData } from "@/features/properties/types"
import { emptyGrid, withLongTitle, withoutImage } from "./derive"

// Los estados borde de la vitrina se DERIVAN copiando un doc real (specs/STYLEGUIDE.md
// §4): funciones PURAS que devuelven un objeto NUEVO y NUNCA mutan el input. Si mutaran,
// corromperían la card "data real" que sale del mismo doc en la misma página (JS pasa
// por referencia). Por eso cada test verifica las DOS cosas: la copia tiene el estado
// borde Y el original quedó intacto.

/** Doc de tarjeta válido y poblado — input fresco por test (no es un fixture a mantener). */
function makeCard(): PropertyCardData {
  return {
    _id: "prop-1",
    title: "Departamento 2 ambientes en Palermo",
    slug: "depto-palermo",
    rooms: 2,
    bathrooms: 1,
    coveredArea: 45,
    zone: "Palermo",
    operations: [{ type: "sale", price: null }],
    mainImage: {
      _type: "image",
      lqip: "data:image/x",
    },
  }
}

describe("withoutImage", () => {
  it("devuelve una copia sin imagen", () => {
    const result = withoutImage(makeCard())
    expect(result.mainImage).toBeNull()
  })

  it("no muta el doc original (sigue con su imagen)", () => {
    const original = makeCard()
    withoutImage(original)
    expect(original.mainImage).not.toBeNull()
  })
})

describe("withLongTitle", () => {
  it("devuelve una copia con un título largo (para probar overflow/truncado)", () => {
    const result = withLongTitle(makeCard())
    expect(result.title).not.toBe(makeCard().title)
    expect((result.title ?? "").length).toBeGreaterThan(80)
  })

  it("no muta el doc original (conserva su título)", () => {
    const original = makeCard()
    const before = original.title
    withLongTitle(original)
    expect(original.title).toBe(before)
  })
})

describe("emptyGrid", () => {
  it("devuelve una grilla vacía", () => {
    expect(emptyGrid()).toEqual([])
  })
})
