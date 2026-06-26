# Testing — Estrategia y herramientas

Fuente de verdad de **cómo se testea** el sitio. Define la pirámide, qué herramienta cubre qué capa y
cómo se corre contra los previews de Vercel. El **deploy** (Vercel) se decide en
[`STACK.md`](STACK.md); el **gate de a11y/CWV** (`lhci`) se describe en [`SEO.md`](SEO.md) — acá solo
se referencian, no se redefinen.

> ↑ **Volver:** [`PRD.md`](PRD.md) (producto · entrada) · [`CLAUDE.md`](CLAUDE.md) (índice).

---

## 1. Principio rector

Dos capas, dos naturalezas. **No se reemplazan entre sí.**

- **Muro determinista** — corre igual siempre, es un **gate** que bloquea el merge. Custodia los
  no-negociables del proyecto (lógica de filtros, a11y, CWV, el flujo de lead). Herramientas: Vitest,
  Playwright, `lhci`.
- **Capa exploratoria** — un agente de IA maneja el browser por intención, **no-determinista**.
  Excelente para smoke y descubrir, **inútil como gate**. Herramienta: `agent-browser`.

**Regla dura:** `agent-browser` es la **capa exploratoria, NO la red de seguridad**. Un sitio con
requisitos duros (100% Lighthouse a11y, 100% teclado, CWV verdes — ver [`PRD.md §6`](PRD.md)) no puede
depender de una herramienta que interpreta. El muro determinista es quien sostiene la barra; el
explorador va encima.

---

## 2. La pirámide

| Capa | Herramienta | Naturaleza | Qué testea en este proyecto |
|------|-------------|-----------|------------------------------|
| Unit / integration | **Vitest** | Determinista · TDD | Lógica pura: contrato Zod de `searchParams` ([`FILTERS.md §3`](FILTERS.md)), ensamblado GROQ + sub-filtro `operations[]` ([`FILTERS.md §2, §4`](FILTERS.md)), formato precio/moneda (`shared/lib`), **orquestación del lead** (`createLead` con fakes: invariante persistir-antes-de-notificar, [`ARCHITECTURE.md §3`](ARCHITECTURE.md)) |
| Component | **Vitest + React Testing Library** | Determinista | Solo componentes **con lógica**: controles de filtro (revelado inline operación→moneda→precio), `LeadForm` (validación en vivo). Colocados (`*.test.tsx`, ver [`ARCHITECTURE.md §6`](ARCHITECTURE.md)) |
| E2E camino crítico | **Playwright** | Determinista · gate | Solo flujos no-negociables: filtro→resultados, **submit de lead** (→ Sanity + Resend), "Cargar más". Arranca finito (1–2 tests), crece con el catálogo |
| Gate a11y / CWV | **`lhci`** | Determinista · gate | 100% a11y + Core Web Vitals. **Fuente única en [`SEO.md §9`](SEO.md)** — no se redefine acá |
| Exploratorio / smoke | **`agent-browser`** | No-determinista (agente) | Smoke adaptativo de flujos; **surfacing de a11y** (labels faltantes / controles inalcanzables afloran en el snapshot); verificación dev-time |

### Elección de herramientas

- **Vitest** sobre Jest: ESM-native, rápido, TS strict, API Jest-compatible, encaja con pnpm/Biome
  (ver [`STACK.md`](STACK.md)).
- **React Testing Library** se aplica **con bisturí**: testea comportamiento por **rol accesible**
  (`getByRole`), no implementación. Un componente presentational puro (ej. `PropertyCard` que solo
  pinta props) **no se testea** — sería testear que React renderiza.
- **Playwright** sobre Cypress: multi-browser, paralelo y **documentado por Vercel** para el bypass de
  previews (§4).

---

## 3. `agent-browser` — el explorador

### Qué es (y qué NO es)

`agent-browser` ([agent-browser.dev](https://agent-browser.dev) ·
[`vercel-labs/agent-browser`](https://github.com/vercel-labs/agent-browser)) es un **CLI de
automatización de browser** (Rust, open source, Vercel Labs) optimizado para que un **agente de IA**
maneje el navegador.

> ⚠️ **No confundir con "Vercel Agent"** (`vercel.com/docs/agent`), que es el agente de code-review del
> dashboard. Son cosas distintas.

### Cómo funciona

Maneja por **significado**, no por selector CSS. Snapshotea el **árbol de accesibilidad** (no el DOM
crudo) y le pone refs cortos y estables a cada elemento interactivo (`@e1`, `@e2`). Esto es:

- **Barato en tokens** — el árbol semántico es chico (~5x menos contexto que Playwright MCP).
- **Alineado con a11y por diseño** — si un elemento no está bien en el árbol de accesibilidad,
  `agent-browser` lo ve roto → **los bugs de a11y afloran solos** mientras se testea funcionalidad.

El agente (Claude, o un loop autónomo) es el **cerebro**; `agent-browser` son las **manos**. El loop:

```
open <url>          → abre Chrome (CDP) y navega
snapshot -i --json  → elementos interactivos con refs + rol + nombre
(el agente lee y decide)
fill @e2 "..." / click @e1   → actúa por ref
snapshot            → re-mapea (la página cambió; refs viejos pueden quedar viejos)
repetir hasta cumplir el objetivo
```

### Instalación

```bash
npm install -g agent-browser
agent-browser install   # baja Chrome for Testing
```

Comandos clave: `open`, `snapshot`, `click`, `fill`, `get text`, `read`, `screenshot`,
`diff screenshot` (regresión visual), `wait`, `eval`, `network route`, `batch`, `--session`/`--restore`
(persistir estado).

### Ejemplo en este proyecto — el embudo de filtros

```bash
agent-browser open http://localhost:3000/propiedades
agent-browser snapshot -i --json   # @e1 tab "Venta" · @e3 combobox "Zona" · @e4 button "Buscar" ...
agent-browser click @e1            # elijo "Venta" → el precio se revela inline
agent-browser snapshot             # refs nuevos: @e5 toggle "USD" ...
agent-browser click @e5            # moneda USD → aparece el slider
agent-browser fill @e8 "200000"    # precio máx
agent-browser click @e4            # Buscar
agent-browser get text @e12        # "12 propiedades" — ¿el contador refleja el filtro?
```

Verifica de una corrida el revelado contextual ([`FILTERS.md §5`](FILTERS.md)), el filtro server-side
y el contador. Si un control no es focuseable o no tiene nombre accesible, el snapshot lo escupe roto.

### Límite

Es **no-determinista**: corre lo mismo dos veces y puede interpretar distinto. Sirve para **explorar
y smoke**, no para detectar regresiones (eso es Vitest/Playwright). Por eso no es un gate de CI.

---

## 4. Testing sobre previews de Vercel

Cada PR genera un **preview deployment** ([`STACK.md`](STACK.md)). Si el preview tiene **Deployment
Protection** activada, los tools automáticos reciben un login o un `403`. Dos caminos:

- **Tools deterministas (Playwright, `lhci`, CI)** → **Protection Bypass for Automation**: un
  secret `VERCEL_AUTOMATION_BYPASS_SECRET` que se manda como header `x-vercel-protection-bypass`. El
  header `x-vercel-set-bypass-cookie: true` setea cookie para que la navegación in-browser posterior
  (clicks, submits) no vuelva a chocar con la protección.
- **`agent-browser`** → **se loguea solo** en la pantalla de Vercel Authentication. No necesita el
  secret.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

if (!process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET requerido para correr contra previews protegidos');
}

export default defineConfig({
  use: {
    baseURL: process.env.VERCEL_PREVIEW_URL,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
      'x-vercel-set-bypass-cookie': 'true',
    },
  },
});
```

**Reglas del secret:** uno por sistema (CI, Playwright…), en el secret manager del CI, **nunca
commiteado**. Si se filtra, se revoca y se redeploya.
Fuente: [Vercel — Automated & Agent Access](https://vercel.com/docs/deployment-protection/automated-agent-access).

---

## 5. TDD

La **capa de lógica pura** (Vitest) sigue **red-green-refactor**: el test va **primero**. Aplica sobre
todo a lo que no puede fallar en silencio:

- El **contrato Zod** de `searchParams` (descartar `priceMin` negativo, parsear multi-valor por coma,
  ignorar enums inválidos sin romper — [`FILTERS.md §3`](FILTERS.md)).
- El **ensamblado GROQ**, en especial el sub-filtro `operations[]` que evalúa operación/moneda/precio
  sobre el **mismo** elemento del array, nunca cruzados ([`FILTERS.md §2`](FILTERS.md)).
- El **formato precio/moneda** dual USD/ARS (`shared/lib`).
- La **orquestación del lead**: el core `createLead(input, { repo, notifier, analytics })` con deps
  inyectadas (fakes) — se testea el **invariante de orden** (persistir en Sanity ANTES de notificar por
  Resend) sin prender servicios reales ([`ARCHITECTURE.md §3`](ARCHITECTURE.md)). Playwright cubre el
  end-to-end real; Vitest cubre el invariante.

---

## 6. CI

Qué corre en el pipeline por PR (proveedor de CI se decide al montar el pipeline; GitHub Issues es el
tracker — ver [`CLAUDE.md`](CLAUDE.md)):

| Paso | ¿Gate? |
|------|--------|
| `pnpm vitest run` (unit + component) | Sí — bloquea si falla |
| `pnpm playwright test` (E2E crítico, contra preview con bypass) | Sí |
| `lhci` (a11y=100 + CWV — [`SEO.md §9`](SEO.md)) | Sí — bloquea si a11y < 100 |
| `agent-browser` (smoke exploratorio) | No — dev-time / on-demand |
