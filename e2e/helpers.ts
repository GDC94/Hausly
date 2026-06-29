import { expect, type Page } from "@playwright/test"

/**
 * Descarta el banner de consentimiento (specs/ANALYTICS.md §6). Es `fixed` y `z-50`
 * → puede tapar controles abajo (ej. el submit del lead). Lo rechazamos antes de
 * interactuar: deja la analítica apagada, que es lo más limpio para un test
 * determinista. Si ya se decidió (no aparece), seguimos sin romper.
 */
export async function dismissConsent(page: Page) {
  const banner = page.getByRole("dialog", { name: "Consentimiento de cookies" })
  // Monta tras hidratar (useEffect) → esperamos un toque a que aparezca; si nunca
  // aparece (consent ya decidido), continuamos.
  const appeared = await banner
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false)
  if (!appeared) return
  await banner.getByRole("button", { name: "Rechazar" }).click()
  await expect(banner).toBeHidden()
}
