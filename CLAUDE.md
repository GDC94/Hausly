# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Proyecto: Sitio web inmobiliaria

## Índice de documentos — LEER ANTES DE CONSTRUIR

Recorrido de lectura, de mayor a menor altitud. **Empezá por el [`PRD.md`](PRD.md)** (el *qué* y el
*por qué*); después los specs (el *cómo*, en orden); [`GRAPHIC.md`](GRAPHIC.md) te ubica visualmente
en cualquier momento; las tareas del build viven en GitHub Issues.

### 1. Producto — la puerta de entrada

| Archivo | Contenido |
|---------|-----------|
| [`PRD.md`](PRD.md) | Producto: **qué** construimos y **por qué**. Problema, usuarios, requisitos como capacidades, Non-Goals, Definition of Done. Destila los specs. **Leé esto primero.** |

### 2. Specs — fuentes de verdad (el *cómo*, en orden)

| Archivo | Contenido |
|---------|-----------|
| [`STACK.md`](STACK.md) | Stack principal + tooling (PNPM, Biome, TS strict, Husky). |
| [`DOMAIN.md`](DOMAIN.md) | Glosario / lenguaje ubicuo: diccionario maestro término-español ↔ identificador-inglés + significado de cada concepto. |
| [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md) | Modelo de dominio: schemas de Sanity (`property`, `zone`, `agency`, `lead`) + JSON de ejemplo. `name` inglés / `title` español. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Estructura de carpetas (feature-based), data flow, rendering, mecanismo de filtros. |
| [`FILTERS.md`](FILTERS.md) | Catálogo de filtros: `searchParam` ↔ campo ↔ predicado GROQ ↔ control UI. Modelo precio/moneda/operación. |
| [`DESIGN.md`](DESIGN.md) | Design tokens: color, tipografía (clases semánticas), radius, shadows, breakpoints, motion, imágenes. |
| [`LAYOUT.md`](LAYOUT.md) | Composición visual / anatomía de páginas (wireframe-level): chrome, home híbrido, `PropertyCard`, listado, detalle (patrón Airbnb), contacto. **Lineamiento inicial, sujeto a rediseño.** No es routing (`ARCHITECTURE §7`) ni tokens (`DESIGN`). |
| [`SEO.md`](SEO.md) | **SEO + SEO local/geo + GEO + Accesibilidad** (guía/checklist accionable). SEO: metadata, JSON-LD `RealEstateListing`, sitemap. Local: GBP, NAP, `RealEstateAgent`. GEO: bots IA, `llms.txt`. A11y: 100% Lighthouse, 100% teclado, contraste WCAG AA. Medición lab vs campo. |
| [`TESTING.md`](TESTING.md) | Estrategia de testing: pirámide determinista (Vitest + RTL, Playwright, `lhci`) + capa exploratoria (`agent-browser`). TDD en lógica pura. Bypass de previews de Vercel. Deploy = Vercel (detalle en `STACK.md`). |
| [`ANALYTICS.md`](ANALYTICS.md) | Estrategia de medición (PostHog): funnel descubrir→lead, taxonomía de ~6 eventos, lead server-side, banner de consentimiento, sin PII / sin replay. `shared/analytics` tipado. |

### 3. Vistas derivadas

| Archivo | Contenido |
|---------|-----------|
| [`GRAPHIC.md`](GRAPHIC.md) | Mapa visual (Mermaid `handDrawn`) de la arquitectura: viaje del dato, camino de las props, render por ruta, cache/revalidación, leads. **Vista derivada** — la fuente de verdad son los specs. |

### 4. Ejecución

| Dónde | Contenido |
|-------|-----------|
| **GitHub Issues** | La lista de tareas del build vive como **issues** (generados con `/to-issues` desde [`PRD.md`](PRD.md)), por slices verticales. **No hay `TASKS.md`**: el tracker es la fuente única de tareas. |

## Reglas del proyecto inmobiliaria

- **Specs antes que código.** No implementar features sin leer el spec correspondiente.
- **Un concepto = una fuente.** No repetir definiciones entre archivos; linkear. Si algo del dominio cambia, se cambia en `DOMAIN.md`/`SANITY-SCHEMA.md`, no en N lugares.
- **Lenguaje ubicuo / idioma.** Código, GROQ, carpetas `features/*` y nombres de componentes en **inglés**. En Sanity, el `name` de los campos en **inglés** (es código) y el `title` del editor en **español**. URLs en **español** (`/propiedades`, `/contacto`) por SEO/mercado AR. Detalle completo (diccionario maestro + significados) en `DOMAIN.md`.

## Non-Goals (MVP)

- NO auth, NO cuentas de usuario, NO favoritos/comparador.
- NO multi-idioma, NO cotización dinámica USD↔ARS.

## Decisiones clave (ver `STACK.md` para detalle)

- **Mercado**: Argentina → precios moneda dual USD + ARS.
- **Arquitectura, filtros y rendering**: mecanismo y estructura en `ARCHITECTURE.md`; **catálogo de filtros** (qué se filtra, params, GROQ) en `FILTERS.md` (fuente única). Resumen: feature-based / screaming (`features/{properties,leads,search}`), filtros GROQ server-side con `searchParams`, render por-ruta (detalle ISR + on-demand revalidation).

## Agent skills

### Issue tracker

Issues viven en **GitHub Issues** (`GDC94/Hausly`) vía el `gh` CLI. PRs externos **NO** son superficie de triage. Ver [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

### Triage labels

Cinco roles canónicos, strings default (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Ver [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Domain docs

Single-context. El glosario del dominio es **[`DOMAIN.md`](DOMAIN.md)** (lenguaje ubicuo) — no hay `CONTEXT.md`. Specs indexados arriba ("Índice de documentos"). ADRs en `docs/adr/` (lazy). Ver [`docs/agents/domain.md`](docs/agents/domain.md).

## Workflow de desarrollo

- **`main` siempre deployable** = producción (Vercel). **El agente NUNCA pushea a `main`.**
- **Una unidad de trabajo = un issue `ready-for-agent` = una rama = un PR = un preview = un squash-merge.**
- Por cada issue:
  1. Sesión fresca · rama desde `main`: `<issue#>-<slug>` (ej. `42-property-card`).
  2. Implementar **TDD** (Vitest primero) respetando los specs · commits **conventional** (sin atribución).
  3. Push → abrir **PR** (`/branch-pr`) · linkear `Closes #<n>`.
  4. **Vercel deploya un preview** del PR → testing real ahí (Playwright con bypass, `agent-browser`, `lhci`). Ver [`TESTING.md`](TESTING.md).
  5. **Gates en el PR**: Vitest + Playwright + `lhci` (+ `/code-review` opcional).
  6. **El usuario revisa y mergea (squash)** → `main` → Vercel deploya a prod. **El merge es decisión del usuario** (merge = deploy a prod).
