import { describe, expect, it } from "vitest"

import { isBlocked } from "./guard"

// Blindaje del laboratorio /styleguide (specs/STYLEGUIDE.md §2/§8): predicado PURO,
// verificable en cada push. El E2E corre contra preview (200), nunca contra prod, así
// que el 404 sólo se prueba acá a nivel lógica. VERCEL_ENV (no NODE_ENV) distingue
// production/preview/development, que es el eje del blindaje.
describe("isBlocked", () => {
  it("bloquea sólo en producción", () => {
    expect(isBlocked("production")).toBe(true)
  })

  it("no bloquea en preview (el PR rinde la vitrina)", () => {
    expect(isBlocked("preview")).toBe(false)
  })

  it("no bloquea en development (dev local rinde la vitrina)", () => {
    expect(isBlocked("development")).toBe(false)
  })

  it("no bloquea si VERCEL_ENV está ausente (build local sin Vercel)", () => {
    expect(isBlocked(undefined)).toBe(false)
  })
})
