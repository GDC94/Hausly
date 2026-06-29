# Audit final (issue #15)

Cierre de calidad sobre el gate que existe desde el #2. Este documento registra **qué
cubre el gate**, **qué se auditó a mano**, los **hallazgos y fixes**, y el **follow-up
operativo** que por naturaleza no se entrega en un PR (CWV de campo).

> Specs relacionados (local): `TESTING.md` (estrategia), `SEO.md §6/§9` (a11y + medición),
> `PRD.md §6` (barra dura: 100% a11y, 100% teclado, CWV verdes).

## 1. El muro determinista (gate de CI)

| Capa | Herramienta | Workflow | Bloquea merge |
|------|-------------|----------|---------------|
| Unit + component | Vitest (154 tests) | `ci.yml` → `quality` | Sí |
| a11y + CWV **lab** | `lhci` (a11y = 100) | `ci.yml` → `lighthouse` | Sí |
| E2E camino crítico | Playwright | `e2e.yml` → `playwright` | Sí (contra el preview) |

### E2E (Playwright) — `e2e.yml`

- Corre **contra el preview de Vercel** ya deployado (RSC + Server Actions + Sanity reales),
  no contra un build local. Usa el **bypass de Deployment Protection**
  (`x-vercel-protection-bypass`, secret en GitHub — ver `TESTING.md §4`).
- **Solo Preview, nunca Production** (`environment == 'Preview'`): el happy-path de lead
  **escribe** en Sanity; contra prod crearía un lead de prueba real. El preview apunta al
  dataset **`staging`** (base de juguete); production al real.
- Tests (`e2e/`): `filters.spec.ts` (listado con resultados, embudo contextual
  operación→moneda→precio, filtros → URL) y `lead.spec.ts` (validación que bloquea envíos
  inválidos + happy-path que persiste y confirma).
- Disparo: `deployment_status` de Vercel (activo tras mergear a `main`) + `workflow_dispatch`
  manual con la URL del preview (para validar un PR antes de mergear).

## 2. Auditoría de teclado / a11y (manual + Lighthouse)

Lighthouse cubre ~30% de los problemas de a11y; el resto es manual. Auditado con
chrome-devtools sobre el sitio con datos reales (dataset `staging`).

**Resultados Lighthouse (desktop) — todas las páginas en 100:**

| Página | Accessibility | Best Practices | SEO |
|--------|:---:|:---:|:---:|
| Home `/` | 100 | 100 | 100 |
| Listado `/propiedades` | 100 | 100 | 100 |
| Contacto `/contacto` | 100 | 100 | 100 |
| Detalle `/propiedades/[slug]` | 100 | 100 | 100 |

**Teclado (verificado end-to-end):**

- ✅ **Skip link** "Saltar al contenido" — primer elemento focuseable, salta el chrome al
  `<main id="main-content">` (WCAG 2.4.1). *(Era un hallazgo: no existía.)*
- ✅ Foco **siempre visible** (ring de 2–3px, token `--ring`).
- ✅ Orden de tabulación lógico; **cero `tabindex` positivos**.
- ✅ El embudo de filtros (radiogroup custom con radios `sr-only`) es operable por teclado y
  muestra foco visible en el segmento.
- ✅ Un solo `h1` por página; jerarquía de headings sin saltos; `lang="es-AR"`; landmarks
  (`header`/`nav`/`main`/`footer`).

## 3. Hallazgos y fixes (aplicados en este PR)

1. **Skip link ausente** → agregado en `app/(site)/layout.tsx` + `id` en `<main>`.
2. **`heading-order`** (a11y 98 → 100): el listado y la landing de zona saltaban `h1`→`h3`
   (las `PropertyCard` son `h3`). Fix: `h2` de región de resultados (sr-only) antes del grid.
3. **`meta-description` vacía en el detalle** (SEO 92 → 100): si la propiedad no tiene
   descripción, la meta quedaba vacía. Fix: **default derivado del contenido** (specs + zona +
   precio) en `buildPropertyMetadata` — `SEO.md §1` "smart defaults". Cubierto por test.

## 4. Follow-up operativo — CWV de campo `[operación]`

Los Core Web Vitals que **Google rankea son los de campo** (CrUX/GSC): usuarios reales
acumulados ~28 días. **No es entregable en un PR** (`SEO.md §9/§10` lo marca `[operación]`).
El lado código ya está:

- ✅ `lhci` gatea a11y/CWV **lab** en cada build.
- ✅ **Vercel Speed Insights** wireado (`app/layout.tsx`) → empieza a capturar CWV de campo en
  producción.

Pendiente operativo (post-deploy, no bloquea el cierre de #15):

- [ ] Verificar el dominio en **Google Search Console** y enviar el `sitemap.xml`.
- [ ] A las ~4 semanas, revisar **CWV de campo** en GSC/CrUX + PageSpeed Insights (campo).
- [ ] Confirmar en logs que bots de IA (`GPTBot`/`PerplexityBot`/`ClaudeBot`) crawlean.
