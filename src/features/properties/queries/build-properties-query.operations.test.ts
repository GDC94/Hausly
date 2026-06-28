import { evaluate, parse } from "groq-js"
import { describe, expect, it } from "vitest"
import type { PropertyFilters } from "@/shared/types"
import { buildPropertiesQuery } from "./build-properties-query"

/**
 * Test DEDICADO del sub-filtro `operations[]` (specs/FILTERS.md §2) — la regla
 * más delicada del proyecto (issue #7).
 *
 * No alcanza con asertar el string de la query: acá se **evalúa la query real**
 * con `groq-js` contra un dataset de fixtures, así probamos de verdad que
 * operación + moneda + precio se evalúan sobre el MISMO elemento del array y
 * **nunca se cruza** una venta-USD con un alquiler-ARS.
 */

type Doc = Record<string, unknown>

// Una propiedad con DOS operaciones simultáneas en monedas distintas: el caso
// que rompe cualquier implementación que evalúe los predicados cruzados.
const dual: Doc = {
  _id: "dual",
  _type: "property",
  _createdAt: "2026-01-03T00:00:00Z",
  title: "Dúplex con venta y alquiler",
  status: "available",
  operations: [
    {
      _type: "operation",
      type: "sale",
      price: { _type: "price", amount: 300000, currency: "USD" },
    },
    { _type: "operation", type: "rent", price: { _type: "price", amount: 50000, currency: "ARS" } },
  ],
}

const cheapUsdSale: Doc = {
  _id: "cheap-usd",
  _type: "property",
  _createdAt: "2026-01-02T00:00:00Z",
  title: "Venta barata en USD",
  status: "available",
  operations: [
    {
      _type: "operation",
      type: "sale",
      price: { _type: "price", amount: 180000, currency: "USD" },
    },
  ],
}

const arsRent: Doc = {
  _id: "ars-rent",
  _type: "property",
  _createdAt: "2026-01-01T00:00:00Z",
  title: "Alquiler en pesos",
  status: "available",
  operations: [
    { _type: "operation", type: "rent", price: { _type: "price", amount: 90000, currency: "ARS" } },
  ],
}

// No disponible: el bloque base `status == "available"` debe excluirla siempre.
const reserved: Doc = {
  _id: "reserved",
  _type: "property",
  _createdAt: "2026-01-04T00:00:00Z",
  title: "Reservada",
  status: "reserved",
  operations: [
    {
      _type: "operation",
      type: "sale",
      price: { _type: "price", amount: 100000, currency: "USD" },
    },
  ],
}

const dataset: Doc[] = [dual, cheapUsdSale, arsRent, reserved]

async function matchedIds(filters: PropertyFilters): Promise<string[]> {
  const { query, params } = buildPropertiesQuery(filters)
  const tree = parse(query, { params })
  const value = await evaluate(tree, { dataset, params })
  const rows = (await value.get()) as Array<{ _id: string }>
  return rows.map((row) => row._id).sort()
}

describe("buildPropertiesQuery · operations[] sub-filter (groq-js, real evaluation)", () => {
  it("excludes non-available properties via the base block", async () => {
    expect(await matchedIds({})).toEqual(["ars-rent", "cheap-usd", "dual"])
  })

  it("'venta USD hasta 200k' matchea la venta barata pero NO cruza la dual", async () => {
    // dual tiene venta-USD 300k (fuera de rango) y alquiler-ARS 50k (barato pero
    // otra moneda/operación). Si los predicados se cruzaran, dual matchearía. NO debe.
    expect(await matchedIds({ operation: "sale", currency: "USD", priceMax: 200000 })).toEqual([
      "cheap-usd",
    ])
  })

  it("'venta USD hasta 350k' sí incluye a la dual (su venta-USD entra en rango)", async () => {
    expect(await matchedIds({ operation: "sale", currency: "USD", priceMax: 350000 })).toEqual([
      "cheap-usd",
      "dual",
    ])
  })

  it("'alquiler ARS hasta 60k' matchea la dual por su alquiler-ARS, no el de 90k", async () => {
    expect(await matchedIds({ operation: "rent", currency: "ARS", priceMax: 60000 })).toEqual([
      "dual",
    ])
  })

  it("filtrar por moneda USD trae solo las que tienen un elemento en USD", async () => {
    expect(await matchedIds({ currency: "USD" })).toEqual(["cheap-usd", "dual"])
  })

  it("'alquiler en USD' no matchea a nadie — la dual tiene rent y USD, pero en elementos distintos", async () => {
    // La prueba definitiva del no-cruce: dual tiene UN alquiler (ARS) y UN USD
    // (venta), pero ningún elemento es a la vez rent Y USD.
    expect(await matchedIds({ operation: "rent", currency: "USD" })).toEqual([])
  })

  it("priceMin acota por el piso del mismo elemento", async () => {
    expect(await matchedIds({ operation: "sale", currency: "USD", priceMin: 200000 })).toEqual([
      "dual",
    ])
  })
})
