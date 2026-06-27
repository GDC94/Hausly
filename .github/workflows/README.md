# CI — gates por PR

`ci.yml` corre en **cada PR a `main`** (y en push a `main`). Dos jobs, ambos pensados
como **gates que bloquean el merge** (vía branch protection de `main`):

| Job | Qué corre | Bloquea si… |
|-----|-----------|-------------|
| `quality` | `pnpm lint` (Biome) · `pnpm typecheck` (tsc) · `pnpm test` (Vitest) | falla lint, type error, o test rojo |
| `lighthouse` | build de producción + **Lighthouse CI** contra `localhost` (mobile, mediana de 3 runs) | **a11y < 100**, **SEO < 98**, o **CWV catastrófico** (LCP > 4s / TBT > 600ms / CLS > 0.1). Perf < 98 → `warn` |

### Por qué Lighthouse mide contra build **local** (no contra el preview)

La accesibilidad es una propiedad del DOM/semántica renderizada → **idéntica** en
`localhost` o en Vercel. Medir local da un gate **determinista, sin secrets y sin
depender de Vercel**. (Decisión registrada del issue #2.)

### Por qué SEO bloquea pero el score de perf no

**SEO** es determinístico (meta tags, `lang`, crawlability) → estable, se gatea duro en
**≥98**. El **score de performance** de Lighthouse es de **laboratorio** y varía por la
carga del runner; en mobile con throttling 4x, una app Next sana ronda ~95 (JS del
framework). Gatearlo duro en 98 sería flaky y bloquearía PRs sanos. Por eso:

- **perf score** → `warn ≥98` (meta visible, no bloquea).
- **piso duro** → vía **CWV** (`LCP > 4s` / `TBT > 600ms` / `CLS > 0.1` bloquean): captura
  regresiones reales sin depender del número exacto.

El CWV **real** es de **campo** (Vercel Speed Insights), fuente de verdad según
`specs/SEO §9`. Umbrales en [`lighthouserc.json`](../../lighthouserc.json).

### Cómo agregar un check nuevo

1. Sumá un step a un job existente, o un job/workflow nuevo.
2. Si debe **bloquear el merge**, agregá el nombre del job a los *required status checks*
   de la branch protection de `main` (**Settings → Branches**, o `gh api`).

### Roadmap de gates

- **Playwright** (E2E camino crítico: filtro→resultados, submit de lead) → se suma en el
  **issue #15**, corriendo contra el **preview de Vercel** con bypass
  (`VERCEL_AUTOMATION_BYPASS_SECRET`, ver `specs/TESTING §4`).
- **lhci contra preview** (CWV-lab del edge, informativo) → opcional, más adelante.
