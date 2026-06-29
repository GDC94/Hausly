import { expect, test } from "@playwright/test"
import { dismissConsent } from "./helpers"

/**
 * Camino crítico del lead (specs/TESTING.md §2, specs/ARCHITECTURE.md §3). Cubre el
 * invariante de UX no-negociable: el form bloquea envíos inválidos en cliente, y un
 * envío válido persiste (Server Action → Sanity) y confirma. El happy path ESCRIBE
 * en el dataset de juguete (nunca en production) — por eso el email va marcado.
 */
test.describe("Lead — formulario de contacto", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contacto")
    await dismissConsent(page)
  })

  test("bloquea el envío si faltan los datos mínimos", async ({ page }) => {
    await page.getByRole("button", { name: "Enviar consulta" }).click()
    // RHF + zod bloquean en cliente: aparece ≥1 error accesible y NO hay confirmación.
    await expect(page.getByRole("alert").first()).toBeVisible()
    await expect(page.getByRole("status")).toHaveCount(0)
  })

  test("envía una consulta válida y muestra la confirmación", async ({ page }) => {
    await page.getByLabel("Nombre").fill("E2E Playwright")
    // Email marcado (e2e+…@hausly.test) → trivial de filtrar/limpiar del dataset.
    await page.getByLabel("Email").fill(`e2e+${Date.now()}@hausly.test`)
    await page.getByLabel("Mensaje").fill("Consulta automatizada de la suite E2E. Ignorar.")

    await page.getByRole("button", { name: "Enviar consulta" }).click()

    // El Server Action persiste en Sanity antes de confirmar → margen para la red.
    await expect(page.getByRole("status")).toContainText("¡Gracias por tu consulta!", {
      timeout: 15_000,
    })
  })
})
