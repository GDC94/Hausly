import { expect, test } from "@playwright/test"

/**
 * Smoke del laboratorio `/styleguide` (specs/STYLEGUIDE.md §8). Corre contra el preview
 * con bypass (VERCEL_ENV=preview → la ruta rinde 200; el 404 de prod NO se prueba acá —
 * ese gate es el unit de `isBlocked` + un smoke manual post-deploy). Verifica que el
 * índice lista las secciones y que cada `[section]` monta 200 sin crashear (data real +
 * derive + todos los componentes). No hay consent banner: la vitrina hereda el root
 * layout pelado, fuera del route group `(site)`.
 */
const SECTIONS = [
  { key: "primitives", title: "Primitivos" },
  { key: "property-card", title: "Property Card" },
  { key: "detail", title: "Detalle" },
  { key: "forms", title: "Formularios" },
  { key: "home", title: "Home" },
  { key: "chrome", title: "Chrome" },
] as const

test.describe("Styleguide — smoke", () => {
  test("el índice lista las secciones del catálogo", async ({ page }) => {
    const response = await page.goto("/styleguide")
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { name: "Catálogo de componentes" })).toBeVisible()

    for (const section of SECTIONS) {
      await expect(page.locator(`a[href="/styleguide/${section.key}"]`)).toBeVisible()
    }
  })

  for (const section of SECTIONS) {
    test(`la sección ${section.key} monta 200 sin crashear`, async ({ page }) => {
      const response = await page.goto(`/styleguide/${section.key}`)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("heading", { level: 1, name: section.title })).toBeVisible()
    })
  }
})
