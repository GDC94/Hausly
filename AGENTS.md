# AGENTS.md — Hausly

Guía para agentes de IA que trabajan sobre este repo en GitHub (Codex, etc.).
**Autosuficiente**: la documentación interna del proyecto (`specs/`) es **local-only y NO está en
GitHub** — no la busques ni inventes links a ella. Todo lo que un agente necesita para construir o
**revisar** vive acá.

> Claude Code usa `CLAUDE.md` (entrada local, ve `specs/`). Este archivo sirve al agente de GitHub.

## Proyecto

Sitio web de una inmobiliaria, mercado Argentina (precios duales USD + ARS). Stack: **Next.js 16
(App Router)** + **Sanity** (CMS) + **Tailwind v4** + **TypeScript strict**, deploy en **Vercel**.
Arquitectura **feature-based / screaming**: `features/{properties,leads,search}` + `shared/`.

### Comandos

| Comando | Qué hace |
|---------|----------|
| `pnpm lint` | Biome (lint + format) |
| `pnpm typecheck` | `tsc --noEmit` (strict) |
| `pnpm test` | Vitest (run) |

Gates de CI en cada PR: `quality` (lint + typecheck + test) y `lighthouse` (**a11y = 100**, **SEO ≥ 98**,
pisos de CWV). El merge a `main` (= deploy a prod en Vercel) lo decide el usuario.

## Reglas duras del proyecto

Destiladas de los specs locales. Son la **vara** contra la que se construye y se revisa.

- **Lenguaje ubicuo / idioma.** Código, GROQ, carpetas `features/*` y nombres de componentes en
  **inglés**. **URLs en español** (`/propiedades`, `/contacto`) por SEO/mercado AR. En Sanity, el
  `name` de los campos en **inglés** (es código) y el `title` del editor en **español**.
- **Arquitectura feature-based / screaming.** `app/` es **solo routing** — cero lógica de negocio
  (un `page.tsx` orquesta: lee `params`/`searchParams`, llama queries de `features/*`, compone
  componentes de `features/*`). **Un feature no importa de otro**; lo común sube a `shared/`. Imports
  desde el **barrel** (`index.ts`). Un presentational reusado consume una **proyección mínima**, no el
  documento entero.
- **Design tokens only.** Prohibido **hex/colores hardcodeados** y `style={{…}}` **inline**. Todo
  color/spacing/tipografía sale de los tokens de Tailwind v4 (`@theme` en `globals.css`). Excepción
  única: valores 100% dinámicos en runtime que no existen en build.
- **Next.js / RSC.** Server Components por **default**; `'use client'` solo en **islas** de
  interactividad. `params` y `searchParams` son **async** (se `await`ean). `next/image` y `next/font`
  **siempre** (nunca `<img>` ni fuentes por `<link>`).
- **Sanity / GROQ.** `defineType`/`defineField` para schemas; `defineQuery` para queries tipadas;
  proyección mínima (no traer campos de más); TypeGen como fuente de tipos.
- **Testing real.** TDD en lógica pura (Vitest primero). **No mockear colaboradores internos** — testear
  por la **interfaz pública**, estilo integración (RTL para componentes; mock solo de bordes externos
  como `next/navigation`).
- **a11y / perf.** Contraste **WCAG AA**, 100% navegable por **teclado**, **foco visible**. CWV sanos
  (LCP, TBT, CLS dentro de los pisos del gate).
- **Commits / PR.** Conventional commits, **SIN `Co-Authored-By` ni atribución de IA**. Branch:
  `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/...`. Todo PR linkea `Closes #N`.
  El agente **NUNCA** pushea a `main`.

### Non-Goals (MVP)

NO auth/cuentas/favoritos. NO multi-idioma. NO cotización dinámica USD↔ARS.

## Review guidelines

Cuando revises un Pull Request, seguí esta metodología (review adversarial estilo *judgment-day*).

**Rol.** Sos un revisor **adversarial e independiente** del PR actual contra `origin/main`. Enfocate en
el **diff**; no re-audites archivos que el PR no toca. Preferí **pocos hallazgos de alta confianza**
sobre muchos ruidosos.

**Target (qué leer).**
- El **diff completo** de la rama del PR contra `origin/main`.
- El **issue linkeado** (`Closes #N` en el cuerpo del PR) — leelo y verificá que el cambio cumple sus
  criterios de aceptación.
- Evaluá los archivos tocados contra las **Reglas duras** de arriba según corresponda.

**Criterios.**
- **Correctness** — bugs reales, edge cases, lógica rota, contratos mal usados.
- **Arquitectura feature-based/screaming** — `app/` sin lógica, sin imports cross-feature, barrel,
  proyección mínima.
- **Next.js / RSC** (si aplica) — límite Server/Client correcto, async `params`/`searchParams`,
  `next/image`/`next/font`.
- **Sanity / GROQ** (si aplica) — `defineQuery`, proyección mínima, tipos de TypeGen.
- **Testing real** — hay tests para la lógica pura; **no se mockean colaboradores internos**.
- **a11y / perf** (si hay UI) — contraste AA, teclado, foco visible, CWV.
- **Reglas de dominio** — no viola el lenguaje ubicuo ni las reglas destiladas de los specs.

**Severidad.**
- **P0 (bloqueante)** — bug de corrección o pérdida de datos; violación a11y AA (contraste, sin nombre
  accesible, no operable por teclado); color/`style` hardcodeado; lógica de negocio en `app/`; import
  cross-feature; secreto commiteado; `Co-Authored-By`/atribución IA en un commit.
- **P1 (alto)** — falta test de lógica pura; mock de colaborador interno; mal uso del límite
  Server/Client (`async` client component, `'use client'` innecesario); no usar `next/image`/`next/font`;
  import fuera del barrel; violación de lenguaje ubicuo; falta `Closes #N`.

Para cada hallazgo, distinguí si es **real** (rompe en uso normal) o **teórico** (escenario rebuscado).

**Salida (veredicto).** Cerrá con un **veredicto**:
- Una **tabla compacta**: `hallazgo · severidad (P0/P1) · archivo:línea · real/teórico`.
- Un fallo global: **APPROVE** (0 P0 y 0 P1 reales) o **CHANGES REQUESTED**.

**No apliques fixes.** Solo reportá. Si el usuario te lo pide explícito con `@codex fix`, recién ahí.

## Author

German Derbes Catoni
