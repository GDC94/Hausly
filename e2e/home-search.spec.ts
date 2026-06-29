import { expect, test } from "@playwright/test"
import { dismissConsent } from "./helpers"

/**
 * Camino crítico: búsqueda desde el hero → listado (specs/LAYOUT.md §3,
 * specs/ANALYTICS.md §4). El hero es el entry-point del funnel y, tras migrar sus
 * `<select>` a los átomos del design system (`Field` + `Select`, issue #35), no
 * tenía cobertura E2E (`filters.spec.ts` entra directo a `/propiedades`). Verifica
 * que los selects rinden con su label accesible (Field asocia label↔control) y que
 * el form GET aterriza en `/propiedades` con los params elegidos.
 */
test.describe("Búsqueda desde el hero", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await dismissConsent(page)
  })

  test("elegir operación y buscar lleva al listado filtrado", async ({ page }) => {
    // Field asocia el label al control → alcanzable por rol/label accesible.
    await expect(page.getByLabel("Operación")).toBeVisible()
    await expect(page.getByLabel("Zona")).toBeVisible()

    await page.getByLabel("Operación").selectOption({ label: "Venta" })
    await page.getByRole("button", { name: "Buscar" }).click()

    // El form GET (progressive enhancement) navega con el param de operación.
    await expect(page).toHaveURL(/\/propiedades\?.*operation=sale/)
  })
})
