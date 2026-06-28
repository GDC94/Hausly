import { describe, expect, it } from "vitest"
import { buildZoneListingHref, buildZoneMetadata } from "./zone-landing-view"

describe("buildZoneListingHref", () => {
  it("apunta al listado interactivo con la zona preseleccionada", () => {
    expect(buildZoneListingHref("palermo")).toBe("/propiedades?zone=palermo")
  })

  it("codifica slugs con caracteres especiales", () => {
    expect(buildZoneListingHref("villa crespo")).toBe("/propiedades?zone=villa%20crespo")
  })
})

describe("buildZoneMetadata", () => {
  it("arma title y h1 geográfico con el nombre de la zona", () => {
    const meta = buildZoneMetadata({ name: "Palermo", slug: "palermo", description: null })
    expect(meta.title).toBe("Propiedades en Palermo")
  })

  it("canonical auto-referente a la propia landing (NO a /propiedades)", () => {
    const meta = buildZoneMetadata({ name: "Palermo", slug: "palermo", description: null })
    expect(meta.alternates?.canonical).toBe("/propiedades/zona/palermo")
  })

  it("es indexable: la landing es el eje SEO local (sin robots noindex)", () => {
    const meta = buildZoneMetadata({ name: "Palermo", slug: "palermo", description: null })
    expect(meta.robots).toBeUndefined()
  })

  it("usa la descripción de la zona, recortada, como meta description", () => {
    const long = "a".repeat(200)
    const meta = buildZoneMetadata({ name: "Palermo", slug: "palermo", description: long })
    expect(meta.description).toBeDefined()
    expect((meta.description as string).length).toBeLessThanOrEqual(155)
    expect(meta.description).toMatch(/…$/)
  })

  it("sin descripción cargada, cae a una meta description geográfica derivada del nombre", () => {
    const meta = buildZoneMetadata({ name: "Palermo", slug: "palermo", description: null })
    expect(meta.description).toContain("Palermo")
  })

  it("tolera una zona sin nombre con un fallback genérico", () => {
    const meta = buildZoneMetadata({ name: null, slug: "palermo", description: null })
    expect(meta.title).toBe("Propiedades por zona")
  })
})
