import { expect, test } from "@playwright/test"
import { dismissConsent } from "./helpers"

/**
 * Camino crítico filtro → resultados (specs/TESTING.md §2, specs/FILTERS.md §5).
 * Cubre lo NO-negociable: el embudo contextual operación→moneda→precio se revela
 * en orden, y al aplicar filtros la URL (única fuente de verdad) refleja los params
 * y el listado re-renderiza. Los asserts no dependen de qué propiedades haya en el
 * dataset salvo el caso base — así el gate no es flaky contra el catálogo real.
 */
test.describe("Filtro → resultados", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/propiedades")
    await dismissConsent(page)
  })

  test("el listado base muestra propiedades", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Propiedades" })).toBeVisible()
    // El contador siempre se renderiza: "N propiedades" | "Mostrando X de Y…".
    await expect(page.locator("p[aria-live='polite']")).toContainText(/propiedad/)
    // Hay catálogo real (el dataset de juguete es copia de production) → ≥1 card.
    await expect(page.locator("article").first()).toBeVisible()
  })

  test("el embudo revela moneda y precio en orden", async ({ page }) => {
    const moneda = page.getByRole("radiogroup", { name: "Moneda" })
    // Sin operación: no hay moneda ni precio todavía (revelado contextual).
    await expect(moneda).toHaveCount(0)
    await expect(page.getByLabel("Máximo (USD)")).toHaveCount(0)

    // Elijo operación → se revela la moneda (pero el precio sigue oculto).
    await page
      .getByRole("radiogroup", { name: "Operación" })
      .getByText("Venta", { exact: true })
      .click()
    await expect(moneda).toBeVisible()
    await expect(page.getByLabel("Máximo (USD)")).toHaveCount(0)

    // Elijo moneda → se revela el rango de precio.
    await moneda.getByText("USD", { exact: true }).click()
    await expect(page.getByLabel("Máximo (USD)")).toBeVisible()
  })

  test("aplicar filtros refleja los params en la URL y re-renderiza el listado", async ({
    page,
  }) => {
    await page
      .getByRole("radiogroup", { name: "Operación" })
      .getByText("Venta", { exact: true })
      .click()
    await page.getByRole("radiogroup", { name: "Moneda" }).getByText("USD", { exact: true }).click()
    // Precio máx muy alto y múltiplo de `step` (1000): no excluye resultados y no
    // dispara el step-mismatch nativo que bloquearía el submit (el form no es
    // `noValidate`).
    await page.getByLabel("Máximo (USD)").fill("100000000")

    await page.getByRole("button", { name: "Aplicar filtros" }).click()

    await expect(page).toHaveURL(/operation=sale/)
    await expect(page).toHaveURL(/currency=USD/)
    await expect(page).toHaveURL(/priceMax=100000000/)
    // El listado re-renderiza coherente: el contador está presente (con resultados
    // o con el empty-state, ambos son una respuesta válida al filtro).
    await expect(page.locator("p[aria-live='polite']")).toContainText(/propiedad/)
  })
})
