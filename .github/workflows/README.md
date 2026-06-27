# CI — gates por PR

`ci.yml` corre en **cada PR a `main`** (y en push a `main`). Dos jobs, ambos pensados
como **gates que bloquean el merge** (vía branch protection de `main`):

| Job | Qué corre | Bloquea si… |
|-----|-----------|-------------|
| `quality` | `pnpm lint` (Biome) · `pnpm typecheck` (tsc) · `pnpm test` (Vitest) | falla lint, type error, o test rojo |
| `lighthouse` | build de producción + **Lighthouse CI** contra `localhost` | **accesibilidad < 100** (`error`). CWV/SEO/perf van como `warn` |

### Por qué Lighthouse mide contra build **local** (no contra el preview)

La accesibilidad es una propiedad del DOM/semántica renderizada → **idéntica** en
`localhost` o en Vercel. Medir local da un gate **determinista, sin secrets y sin
depender de Vercel**. El CWV **real** es de **campo** (Vercel Speed Insights), que es la
fuente de verdad según `specs/SEO §9` — el número lab de Lighthouse es señal blanda, por
eso va como `warn`. (Decisión registrada del issue #2.)

Umbrales en [`lighthouserc.json`](../../lighthouserc.json).

### Cómo agregar un check nuevo

1. Sumá un step a un job existente, o un job/workflow nuevo.
2. Si debe **bloquear el merge**, agregá el nombre del job a los *required status checks*
   de la branch protection de `main` (**Settings → Branches**, o `gh api`).

### Roadmap de gates

- **Playwright** (E2E camino crítico: filtro→resultados, submit de lead) → se suma en el
  **issue #15**, corriendo contra el **preview de Vercel** con bypass
  (`VERCEL_AUTOMATION_BYPASS_SECRET`, ver `specs/TESTING §4`).
- **lhci contra preview** (CWV-lab del edge, informativo) → opcional, más adelante.
