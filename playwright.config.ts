import { defineConfig, devices } from "@playwright/test"

/**
 * Config E2E (specs/TESTING.md §2 "muro determinista", §4 "previews de Vercel").
 *
 * Dos modos:
 * - **Contra un preview de Vercel** (`VERCEL_PREVIEW_URL` seteada): el gate de CI.
 *   Si el preview tiene Deployment Protection, hace falta el bypass: mandamos el
 *   header `x-vercel-protection-bypass` en cada request y `x-vercel-set-bypass-cookie`
 *   para que la navegación in-browser (clicks, submits) no vuelva a chocar el 401.
 * - **En local** (sin `VERCEL_PREVIEW_URL`): corre contra el dev server, sin bypass.
 *   Útil para iterar; NO es el gate.
 */
const previewUrl = process.env.VERCEL_PREVIEW_URL
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const isPreview = Boolean(previewUrl)

if (isPreview && !bypassSecret) {
  throw new Error(
    "VERCEL_AUTOMATION_BYPASS_SECRET requerido para correr contra previews protegidos de Vercel (specs/TESTING.md §4).",
  )
}

const baseURL = previewUrl ?? "http://localhost:3000"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // En CI, un `.only` colado es un error: nunca debe pasar el gate a medias.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    extraHTTPHeaders: isPreview
      ? {
          "x-vercel-protection-bypass": bypassSecret as string,
          "x-vercel-set-bypass-cookie": "true",
        }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // En local levantamos el dev server si no hay uno ya corriendo. Contra un
  // preview no aplica (el sitio ya está deployado).
  webServer: isPreview
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
