import { describe, expect, it } from "vitest"

import { isBlocked } from "./blindaje"

// El blindaje del laboratorio /styleguide (specs/STYLEGUIDE.md §2): la ruta es
// alcanzable en dev y en el preview del PR, pero INVISIBLE en producción. La decisión
// se aísla en este predicado PURO para que el gate sea verificable en cada push (§8) —
// el E2E corre contra preview (200), nunca contra prod, así que el 404 sólo se prueba
// acá a nivel lógica. Se usa VERCEL_ENV (no NODE_ENV) porque distingue
// production/preview/development, que es el eje exacto del blindaje.
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
