# Stack tecnológico — Sitio inmobiliaria

Fuente de verdad de las decisiones técnicas del proyecto. Se define **antes** de codear.

---
 
## 1. Stack principal

| Capa | Herramienta | Por qué |
|------|-------------|---------|
| Framework | **Next.js (App Router) + TypeScript** | SEO crítico para inmobiliaria: SSG/ISR por propiedad, `next/image` para optimizar fotos, Server Components para filtros server-side. |
| CMS | **Sanity** (Studio embebido en `/studio`) | Editor para gente no técnica (carga propiedades + fotos) + pipeline de imágenes (hotspot, crop, transform). |
| Estilos | **Tailwind CSS v4** | Utility-first, productivo, estándar. **Config CSS-first**: el theme se define con la directiva `@theme` en CSS (tokens como custom properties: `--color-*`, `--font-*`, `--text-*`, `--breakpoint-*`), sin `tailwind.config.ts`. Los **tokens concretos** (paleta, tipografía, escalas) viven en `DESIGN.md`, no acá. |
| Componentes UI | **shadcn/ui** (estilo `new-york`) | Primitivas **copy-in** (Radix + Tailwind v4): la CLI copia el código a tu repo, lo **poseés** — no es dependencia black-box. Viven en `shared/ui` (CLI redirigida vía `components.json`). Theming por CSS vars + `@theme inline` → mapean a los tokens de `DESIGN.md`. Tus componentes de dominio se construyen **encima** de estas primitivas. |
| Animación | **CSS transitions / `@keyframes` + View Transitions API** (nativo, 0 KB) | Default del MVP: hover, fades, reveals y transición de página sin JS extra. Siempre bajo `prefers-reduced-motion`. **GSAP diferido — posible incorporación luego**: solo si una pantalla justifica una timeline real (hero coreografiado, scroll-scrubbing/pin); ahí se suma **lazy, por-ruta**, nunca en el bundle base. Evita peso "por las dudas" (YAGNI) y mantener server components donde `useGSAP` los volvería client. |
| Mapas | **Mapa estático** (Static Images API → `<img>` con `alt`) | MVP: "dónde queda" con una imagen estática (cero JS), click → abre Google Maps en tab nuevo. Usa el `geopoint` nativo de Sanity. **Interactivo (Mapbox GL) diferido**: ~200KB + WebGL `<canvas>` choca con la barra dura de CWV/a11y ([`SEO.md §6`](SEO.md)); si entra, va **lazy + dynamic import** bajo interacción, nunca en el bundle inicial. |
| Emails (leads) | **Resend** + link de WhatsApp | Captura de consultas sin infra propia. |
| Tipos | **Sanity TypeGen** | Tipos TS generados desde schema + queries GROQ → type-safe punta a punta. |
| Validación | **Zod** | Validación en **runtime** de los datos que entran por los bordes: form de leads, `searchParams` de filtros, payload del webhook de Sanity, env vars. **Complementa a TypeGen, no lo reemplaza**: TypeGen tipa el contenido del CMS en compile-time; Zod valida en runtime lo que TS no puede garantizar (input del usuario, URL, webhooks). |
| Formularios | **React Hook Form** + `@hookform/resolvers` | Form de leads: validación en **cliente** (UX, errores en vivo) con el resolver de Zod. Integración first-class con el `Form` de shadcn/ui. El submit va a un **Server Action** que **re-valida con el mismo schema Zod** (nunca confiar en el cliente). Un schema, dos lados. |
| Deploy | **Vercel** | Mismo equipo que Next.js: ISR / on-demand revalidation nativos, `next/image` optimizado en el Edge, **preview deployment por PR** (cada rama = URL propia, base del testing E2E). Bypass de previews protegidos para CI → [`TESTING.md §4`](TESTING.md). |
| Analytics | **PostHog** | Medición de conducta (funnel descubrir→lead). `posthog-js` (cliente) + `posthog-node` (lead server-side). Reverse proxy, cookies + consentimiento, sin session replay. Estrategia completa → [`ANALYTICS.md`](ANALYTICS.md). |

---

## 2. Tooling

### PNPM — gestor de paquetes
- Rápido y disk-efficient (store global + symlinks, no duplica deps).
- `node_modules` estricto: evita acceso a deps fantasma (phantom dependencies).
- Comandos base: `pnpm install`, `pnpm dev`, `pnpm build` y `pnpm format`.

### Biome — linter + formatter (en uno)
- Reemplaza **ESLint + Prettier** con un solo binario (Rust, muy rápido).
- Config única: `biome.json`. Comandos: `biome check`, `biome format`, `biome lint`.
- **Hooks rules**: Biome **ya las trae** (`useExhaustiveDependencies` ≈ `exhaustive-deps`,
  `useHookAtTopLevel` ≈ rules-of-hooks). No hay gap ahí. (Verificar contra la versión instalada.)
- ⚠️ **Gap real**: Biome **no** tiene las reglas específicas de `next/image` (no te avisa de un `<img>`
  crudo, o `fill` sin `sizes`). **Decisión: NO se reintroduce ESLint por esto** — revivir dos
  herramientas que Biome vino a unificar no se justifica por un puñado de reglas.
- **Quién protege las imágenes entonces**: el **gate de Lighthouse CI** (`lhci`, ver [`SEO.md §9`](SEO.md)).
  Lighthouse caza exactamente los problemas de imagen (CLS, LCP pobre, `<img>` sin dimensiones, sin
  optimizar) y **bloquea el merge**. La red de seguridad de imágenes es el gate de CWV/a11y, **no el
  linter**. El patrón correcto de uso vive en [`DESIGN.md §9`](DESIGN.md).

### TypeScript strict
- `"strict": true` en `tsconfig.json` desde el día uno (no se activa "después").
- Sin `any` implícito, null-safety, etc.
- Combina con Sanity TypeGen → el contenido del CMS llega tipado al front.

### Husky + lint-staged — git hooks
- **Husky**: instala hooks de Git (`pre-commit`).
- **lint-staged**: corre `biome check --apply` solo sobre los archivos staged (rápido).
- Objetivo: nada entra al repo sin pasar lint + format. Calidad antes del commit.

### Testing — Vitest, Playwright, lhci, agent-browser
- Estrategia completa (pirámide determinista + capa exploratoria) en [`TESTING.md`](TESTING.md) —
  **fuente única**. Resumen: **Vitest** (+ RTL) para lógica y componentes con lógica, **Playwright**
  para E2E crítico, **`lhci`** como gate de a11y/CWV (descrito en [`SEO.md §9`](SEO.md)),
  **`agent-browser`** para smoke exploratorio. No se redefine acá — "un concepto = una fuente".

### Sanity MCP — herramienta de trabajo con Sanity
- Se trabaja con Sanity vía su **MCP** (ya instalado): queries GROQ, crear/editar/publicar documentos, leer/deployar schema, gestión de proyecto/dataset, lookup de docs oficiales y semantic search.
- Útil para: crear el proyecto/dataset al scaffoldear, **deployar el schema**, sembrar contenido de ejemplo (ej. la `propiedad` modelo de `SANITY-SCHEMA.md`) y consultar datos.
- ⚠️ **Límite**: el MCP **opera** Sanity, no reemplaza el código. El **source del schema** (archivos `defineType` en `src/sanity/schemaTypes/`) vive en el repo y es la fuente de verdad; el MCP lo deploya, no lo sustituye. Modelo en [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md).

---

## 3. Convenciones

- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`…).
- **Arquitectura, filtros y rendering**: definidos en [`ARCHITECTURE.md`](ARCHITECTURE.md)
  (estructura feature-based, data flow, filtros GROQ server-side y estrategia de render por-ruta).
  No se redefinen acá — **un concepto = una fuente**.
