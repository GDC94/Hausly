import { describe, expect, it } from "vitest"
import { buildAgencyJsonLd } from "./agency-json-ld"

const SITE = "https://hausly.test"

const fallback = {
  name: "Hausly",
  phone: "+54 11 5555-1234",
  email: "hola@hausly.com.ar",
  address: "Av. del Libertador 1234, CABA, Argentina",
  socials: { instagram: "https://instagram.com/hausly", facebook: "https://facebook.com/hausly" },
}

const zones = [
  { name: "Palermo", slug: "palermo" },
  { name: "Belgrano", slug: "belgrano" },
]

const baseOpts = { siteUrl: SITE, zones, fallback, imageUrl: () => "https://cdn.test/logo.png" }

describe("buildAgencyJsonLd", () => {
  it("is a RealEstateAgent entity with a stable @id and url", () => {
    const ld = buildAgencyJsonLd(null, baseOpts)
    expect(ld["@context"]).toBe("https://schema.org")
    expect(ld["@type"]).toBe("RealEstateAgent")
    expect(ld["@id"]).toBe(`${SITE}/#agency`)
    expect(ld.url).toBe(SITE)
  })

  it("prefers Sanity agency data over the fallback (coalesce)", () => {
    const ld = buildAgencyJsonLd(
      {
        name: "Inmobiliaria Real",
        phone: "+54 11 9999-0000",
        email: "real@inmo.com",
        address: "Calle Verdadera 1, CABA",
        logo: null,
        socials: { instagram: "https://instagram.com/real", facebook: null },
      },
      baseOpts,
    )
    expect(ld.name).toBe("Inmobiliaria Real")
    expect(ld.telephone).toBe("+54 11 9999-0000")
    expect(ld.email).toBe("real@inmo.com")
    expect(ld.sameAs).toEqual(["https://instagram.com/real"])
  })

  it("falls back to site config when the agency singleton is missing", () => {
    const ld = buildAgencyJsonLd(null, baseOpts)
    expect(ld.name).toBe("Hausly")
    expect(ld.telephone).toBe("+54 11 5555-1234")
    expect(ld.email).toBe("hola@hausly.com.ar")
    expect(ld.sameAs).toEqual(["https://instagram.com/hausly", "https://facebook.com/hausly"])
  })

  it("maps zones to areaServed as named Places", () => {
    const ld = buildAgencyJsonLd(null, baseOpts)
    expect(ld.areaServed).toEqual([
      { "@type": "Place", name: "Palermo" },
      { "@type": "Place", name: "Belgrano" },
    ])
  })

  it("omits areaServed when there are no zones", () => {
    const ld = buildAgencyJsonLd(null, { ...baseOpts, zones: [] })
    expect(ld.areaServed).toBeUndefined()
  })

  it("exposes the address as a PostalAddress in Argentina", () => {
    const ld = buildAgencyJsonLd(null, baseOpts)
    expect(ld.address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: "Av. del Libertador 1234, CABA, Argentina",
      addressCountry: "AR",
    })
  })

  it("resolves the Sanity logo through the injected image resolver", () => {
    const ld = buildAgencyJsonLd(
      {
        name: "Hausly",
        phone: null,
        email: null,
        address: null,
        logo: { _type: "image", asset: { _ref: "image-abc", _type: "reference" } },
        socials: null,
      },
      baseOpts,
    )
    expect(ld.logo).toBe("https://cdn.test/logo.png")
    expect(ld.image).toBe("https://cdn.test/logo.png")
  })

  it("omits the logo when there is no image asset", () => {
    const ld = buildAgencyJsonLd(null, baseOpts)
    expect(ld.logo).toBeUndefined()
    expect(ld.image).toBeUndefined()
  })

  it("drops sameAs entirely when no socials are configured", () => {
    const ld = buildAgencyJsonLd(null, {
      ...baseOpts,
      fallback: { ...fallback, socials: { instagram: null, facebook: null } },
    })
    expect(ld.sameAs).toBeUndefined()
  })
})
