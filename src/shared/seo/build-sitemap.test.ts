import { describe, expect, it } from "vitest"
import { buildSitemap } from "./build-sitemap"

const SITE = "https://hausly.test"

const properties = [
  { slug: "duplex-en-palermo", _updatedAt: "2026-02-01T00:00:00Z" },
  { slug: "casa-en-belgrano", _updatedAt: "2026-03-10T00:00:00Z" },
]

const zones = [{ slug: "palermo" }, { slug: "belgrano" }]

describe("buildSitemap", () => {
  const entries = buildSitemap({ siteUrl: SITE, properties, zones })
  const urls = entries.map((e) => e.url)

  it("includes the static routes", () => {
    expect(urls).toContain(`${SITE}`)
    expect(urls).toContain(`${SITE}/propiedades`)
    expect(urls).toContain(`${SITE}/contacto`)
  })

  it("includes one entry per property with its lastModified", () => {
    const entry = entries.find((e) => e.url === `${SITE}/propiedades/duplex-en-palermo`)
    expect(entry).toBeDefined()
    expect(entry?.lastModified).toBe("2026-02-01T00:00:00Z")
  })

  it("includes one entry per zone landing", () => {
    expect(urls).toContain(`${SITE}/propiedades/zona/palermo`)
    expect(urls).toContain(`${SITE}/propiedades/zona/belgrano`)
  })

  it("gives the home the highest priority", () => {
    const home = entries.find((e) => e.url === SITE)
    expect(home?.priority).toBe(1)
  })

  it("never emits a relative or doubled-slash URL", () => {
    for (const url of urls) {
      expect(url.startsWith(SITE)).toBe(true)
      expect(url.slice(SITE.length).includes("//")).toBe(false)
    }
  })

  it("encodes reserved characters in slugs", () => {
    const out = buildSitemap({
      siteUrl: SITE,
      properties: [{ slug: "lote 5#a", _updatedAt: null }],
      zones: [{ slug: "san isidro" }],
    })
    const out_urls = out.map((e) => e.url)
    expect(out_urls).toContain(`${SITE}/propiedades/lote%205%23a`)
    expect(out_urls).toContain(`${SITE}/propiedades/zona/san%20isidro`)
  })

  it("survives empty content with just the static routes", () => {
    const empty = buildSitemap({ siteUrl: SITE, properties: [], zones: [] })
    expect(empty.map((e) => e.url)).toEqual([SITE, `${SITE}/propiedades`, `${SITE}/contacto`])
  })
})
