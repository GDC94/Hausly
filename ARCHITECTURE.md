# Arquitectura — Estructura de carpetas y data flow

Fuente de verdad de la **estructura del proyecto**. Define carpetas, dónde vive cada cosa y cómo fluyen los datos.
Decisiones de stack en [`STACK.md`](STACK.md). Dominio en [`DOMAIN.md`](DOMAIN.md). Schemas en [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md). Tokens en [`DESIGN.md`](DESIGN.md).

---

## 1. Principio rector

**Screaming / feature-based architecture.** Las carpetas gritan el *dominio* (propiedades, leads, search), no la *tecnología* (components, hooks, utils sueltos).

Next.js es **unopinionated** sobre organización ([docs oficiales](https://nextjs.org/docs/app/getting-started/project-structure#organizing-your-project)) y ofrece 3 estrategias. Adoptamos la oficial **"Store project files outside of `app`"**:

> `app/` se mantiene **puro para routing**. Todo el código de aplicación vive en carpetas hermanas.

Esto resuelve la tensión App Router ↔ screaming architecture:
- `app/` = **capa fina de routing** (file-system routing, lo impone Next).
- `features/` = **dominio** (lógica, componentes, queries, validación).
- `shared/` = cross-cutting (cliente Sanity, primitivas UI, utils).

---

## 2. Estructura

```
src/
├── app/                          # SOLO routing. Lo que devuelve page/route llega al cliente.
│   ├── layout.tsx                # ROOT layout: <html>/<body>, fonts, providers. Mínimo común a TODO.
│   ├── (site)/                   # route group: sitio público. NO afecta la URL.
│   │   ├── layout.tsx            # shell del sitio: header + footer
│   │   ├── page.tsx              # home (/)
│   │   ├── propiedades/
│   │   │   ├── page.tsx          # listado + filtros (lee searchParams) — cacheado por tags
│   │   │   ├── zona/
│   │   │   │   └── [zona]/
│   │   │   │       └── page.tsx  # landing por zona (estática, SEO local) — generateStaticParams
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # detalle (ISR)
│   │   └── contacto/
│   │       └── page.tsx          # contacto
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx          # Sanity Studio embebido — sin chrome del sitio
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts          # webhook Sanity → on-demand revalidation
│   ├── sitemap.ts                # SEO (ver SEO.md)
│   └── robots.ts
│
├── features/                     # DOMINIO. Una carpeta por bounded context (nombres en inglés = código).
│   ├── properties/
│   │   ├── components/           # PropertyCard, PropertyGallery, PriceTag…
│   │   ├── queries/              # GROQ + defineQuery (server-side)
│   │   ├── schemas/              # Zod — validación en bordes
│   │   └── types/                # tipos derivados de TypeGen
│   ├── leads/
│   │   ├── components/           # LeadForm, WhatsAppButton
│   │   ├── actions/              # Server Actions (envío form → Resend)
│   │   └── schemas/              # Zod — valida input del form
│   └── search/
│       ├── components/           # filtros UI (controles)
│       └── lib/                  # searchParams ⇄ filtros GROQ
│
├── shared/                       # Cross-cutting, sin dominio propio.
│   ├── sanity/                   # client, image-url builder, config, env
│   ├── ui/                       # primitivas shadcn/ui (copy-in) + atomic (ver DESIGN.md, STACK.md)
│   ├── types/                    # contrato PropertyFilters (compartido search↔properties)
│   └── lib/                      # helpers genéricos (formato precio, etc.)
│
└── styles/
    └── globals.css               # @import "tailwindcss" + @theme (tokens → DESIGN.md)
```

### Reglas de ubicación

- **`app/` no contiene lógica de negocio.** Un `page.tsx` orquesta: lee `searchParams`/`params`, llama a `features/*/queries`, compone `features/*/components`. Nada más.
- **Un feature no importa de otro feature.** Si dos features necesitan lo mismo → sube a `shared/`.
- **Colocación cuando es estrictamente de una ruta:** Next permite colocar archivos no-routables dentro de `app/` con carpetas privadas `_folder` ([docs](https://nextjs.org/docs/app/getting-started/project-structure#private-folders)). Lo usamos **solo** para UI atada a una única ruta; el dominio reutilizable va en `features/`.
- **Route groups `(grupo)`** para agrupar rutas/layouts sin tocar la URL, si aparece una sección con layout propio (ej. `(marketing)`).

---

## 3. Data flow

Unidireccional, server-first. La URL es la fuente de verdad del estado de búsqueda.

```
URL (searchParams)
  → search/lib: parse + valida con Zod → objeto PropertyFilters (tipo de shared/types)
  → properties/queries: PropertyFilters → arma GROQ tipado (defineQuery) + fetch
  → Sanity (server)
  → tipos de TypeGen
  → RSC (Server Component) renderiza
  → features/*/components (UI)
```

- **Seam search↔properties.** `search/lib` hace UNA cosa: `searchParams → PropertyFilters` validado.
  `properties/queries` hace la otra: `PropertyFilters → GROQ + fetch`. **El ensamblado del GROQ tiene
  un solo dueño** (properties), nunca los dos. El tipo `PropertyFilters` es el **contrato** entre ambos
  y vive en `shared/types` (no en un feature) — así properties no importa de search (regla §2).

- **Filtros server-side con GROQ.** `searchParams` = única fuente de verdad (no estado de cliente duplicado). Cambiar un filtro = navegar a otra URL. El **catálogo concreto** (qué se filtra, params, predicados GROQ) vive en [`FILTERS.md`](FILTERS.md); acá solo el mecanismo.
- **Zod en los bordes.** Todo lo que entra de afuera (searchParams, form de leads, payload del webhook) se valida en runtime antes de tocar el dominio. Complementa a TypeGen (ver [`STACK.md`](STACK.md)).
- **Leads:** `LeadForm` (React Hook Form, valida en cliente con Zod) → **Server Action** re-valida con el **mismo** schema Zod → **(1) guarda un document `lead` en Sanity** (registro durable) → **(2) notifica vía Resend**. Schema único en `features/leads/schemas/`, consumido por cliente y servidor. Nunca confiar en el cliente. **El orden importa**: el `lead` se persiste primero; si Resend falla, la consulta igual quedó guardada (un lead = posible venta, no puede depender de un email). Doc type `lead` → [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md).
  - **Forma del módulo (testabilidad).** El Server Action es un **adapter fino**: delega en un core con dependencias inyectadas — `createLead(input, { repo, notifier, analytics })`. La orquestación y **el invariante de orden (persistir antes de notificar)** viven en ese core, que se testea con **fakes** (Vitest), sin prender Sanity/Resend/PostHog reales. El Action solo cablea los adapters reales. El evento `lead_submitted` (server-side) se dispara desde acá → [`ANALYTICS.md §5`](ANALYTICS.md). Estrategia de test → [`TESTING.md`](TESTING.md).

---

## 4. Rendering

| Ruta | Estrategia | Por qué |
|------|-----------|---------|
| Home `/` | Static / ISR | Contenido estable, SEO. |
| Listado `/propiedades` | Server-render con `searchParams`, **cacheado por tags** | Filtros server-side. La query usa `sanityFetch` + `next: { tags: ['property'] }`; NO full-dynamic. Vistas calientes cacheadas (TTFB/LCP bajos, menos costo Sanity), invalidadas por contenido vía `revalidateTag` (no TTL). Paginación por lotes con **"Cargar más"** sobre URLs crawleables (`?offset=`), **no infinite scroll** — catálogo y porqué en [`FILTERS.md §4,§5`](FILTERS.md). |
| Zona `/propiedades/zona/[zona]` | **Estática** + `generateStaticParams` | Landing geográfica indexable (SEO local, [`SEO.md §7`](SEO.md)). Una ruta por `zone`, canonical propio. Eje finito de alto valor → URL real, no querystring. Segmento `zona/` estático evita la colisión con `[slug]` (dos slugs dinámicos hermanos = build error). El filtro libre sigue en `searchParams` (noindex). |
| Detalle `/propiedades/[slug]` | **ISR** + `generateStaticParams` | SEO crítico por propiedad. **Volumen de lanzamiento <20 (carga manual)** → `generateStaticParams` **pre-genera todas** en el build (instantáneo, sin ISR on-demand inicial). El ISR on-demand entra en juego cuando el catálogo crezca. |
| — revalidación | **On-demand vía webhook** (`/api/revalidate`) | Al publicar en Sanity, se revalida solo esa propiedad. No esperar TTL. |

El webhook de Sanity llega a `app/api/revalidate/route.ts`, valida el payload (Zod + secret) y llama `revalidatePath`/`revalidateTag`.

---

## 5. Convenciones de archivos

- `src/` activado (separa código de config del root). Ver [docs `src`](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder).
- Special files de Next sin renombrar: `page`, `layout`, `loading`, `error`, `not-found`, `route`, `sitemap`, `robots`.
- Nombres de dominio = lenguaje ubicuo de [`DOMAIN.md`](DOMAIN.md). Mismo nombre en CMS, código y UI.

---

## 6. Anatomía de un componente

Cada componente es un **módulo autocontenido**: una carpeta PascalCase con todo lo suyo adentro. Container/presentational + atomic design (tokens en [`DESIGN.md`](DESIGN.md)).

### Naming

- **PascalCase** siempre: `PropertyCard`, no `cardProperty`/`card-property`.
- **Sustantivo de dominio + rol**: `PropertyCard`, `PropertyGallery`, `LeadForm`. El sustantivo sale del lenguaje ubicuo de [`DOMAIN.md`](DOMAIN.md).
- Carpeta = nombre del componente. Archivo = mismo nombre. `index.ts` solo re-exporta (barrel).

### Forma según tamaño — **empezá plano, promové cuando crece**

**Nivel 1 — componente simple** (la mayoría). Sin subcarpetas:

```
PropertyCard/
├── PropertyCard.tsx        # el componente (presentational por defecto)
├── PropertyCard.test.tsx   # test colocado
└── index.ts                # export { PropertyCard }
```

**Nivel 2 — componente con piezas propias.** Solo cuando *realmente* aparecen subcomponentes/lógica usados **solo acá**:

```
PropertyCard/
├── PropertyCard.tsx        # orquesta y compone (container)
├── PropertyCard.test.tsx
├── index.ts
├── components/             # subcomponentes privados (NO se usan fuera)
│   ├── PriceTag.tsx
│   └── PropertyBadge.tsx
├── hooks/                  # hooks propios (si es client component)
│   └── useFavoriteToggle.ts
└── utils/                  # helpers puros, testeables aislados
    └── formatSurface.ts
```

### Tamaño — componentes chicos, testables

**Regla:** un componente hace UNA cosa. Chico se testea fácil; grande esconde varias responsabilidades y el test se vuelve un infierno.

- **~150 líneas = olor, no ley.** No es un número mágico: es la señal de que probablemente hay más de una responsabilidad adentro. Al cruzarlo, **subdividí** — extraé subcomponentes a `components/`, lógica a `hooks/`, cálculo puro a `utils/`.
- **Si cuesta nombrar el componente o el test, ya es muy grande.** Un nombre claro = una responsabilidad clara.
- Subdividir baja el LOC *y* hace que cada pieza sea testeable en aislamiento (la `utils/` pura se testea sin renderizar nada).

### Dónde van los utils — escalera, no duplicación

Un helper se ubica según **quién lo usa**. Si sube de nivel, se mueve; **nunca se copia**.

| Lo usa… | Vive en |
|---------|---------|
| Solo este componente | `PropertyCard/utils/` |
| Varios componentes del mismo feature | `features/<feature>/lib/` |
| Más de un feature (genérico) | `shared/lib/` |

Empezás en el nivel más bajo. El día que un segundo consumidor lo necesita, **subís** el util un escalón; no lo duplicás.

### Reglas

- **No crees `utils/`, `hooks/`, `components/` vacíos "por las dudas".** Carpeta vacía = ruido. Nacen cuando hay contenido real.
- **Subcomponente reutilizado por otro componente** → deja de ser privado: sube a `features/<feature>/components/` o, si cruza features, a `shared/ui/`.
- **Presentational por defecto** (recibe props, no hace fetch). El fetch vive en `queries/` y lo invoca el `page.tsx` o un container.
- **Un archivo, un componente público.** Subcomponentes privados pueden vivir en `components/`, no sueltos en el mismo `.tsx`.
- **Import desde el barrel**: `import { PropertyCard } from '@/features/properties/components/PropertyCard'`.
- **Prohibido `style={{…}}` inline.** Todo estilo va por utilities de Tailwind / tokens de [`DESIGN.md`](DESIGN.md). Un valor inline escapa al design system (no es token, no tiene responsive ni estados) = **drift**. **Excepción**: valores 100% dinámicos en runtime que no existen en build (ej. inyectar una CSS var calculada en JS/GSAP, como `--loop-index` para un stagger) → se **discute ANTES**, caso por caso.

---

## 7. Layouts y páginas

Modelo oficial de App Router ([docs](https://nextjs.org/docs/app/getting-started/layouts-and-pages)): un **layout** es UI compartida que envuelve a **todos** sus hijos; en navegación **preserva estado y NO se re-renderiza**. Una **página** es la UI de una ruta puntual.

> Acá se define el layout de **routing** (qué `layout.tsx` envuelve qué). La **composición visual** de
> cada página (qué secciones, en qué orden, anatomía de la card) vive en [`LAYOUT.md`](LAYOUT.md).

### Regla mental — ¿layout o componente?

> **Layout** = chrome presente en **TODAS** las páginas descendientes (header, footer).
> **Componente compartido** = UI que aparece en *algunas* páginas → vive en `features/`/`shared/` y se **importa**, NO se mete en un layout.

Ejemplo concreto: los **filtros** están en home y `/propiedades`, pero NO en detalle ni contacto → componente de `features/search`, importado. No son layout.

**Header y Footer SÍ son universales del sitio** (están en todas las páginas públicas) → van en el shell `(site)`.

### Layouts del proyecto

| Layout | Contenido | Envuelve |
|--------|-----------|----------|
| `app/layout.tsx` (root, **obligatorio**) | `<html>`/`<body>`, fonts, providers globales. **Mínimo**, sin chrome. | TODO |
| `app/(site)/layout.tsx` | **Header + Footer** (chrome del sitio) | home, `/propiedades`, detalle, contacto |
| Studio (`app/studio/...`) | — (hereda solo el root pelado) | Sanity Studio |

**Por qué el route group `(site)`:** el header/footer son del **sitio**, no del Studio (territorio Sanity). Si el chrome viviera en el root layout, se filtraría al Studio. Solución: root mínimo, chrome en `(site)/layout.tsx`, y el Studio **fuera** del grupo → hereda solo `<html>/<body>`, sin chrome. `(site)` no aparece en la URL.

### Páginas y su composición

| Ruta | Página compone | Render |
|------|----------------|--------|
| `/` home | filtros (`features/search`) + destacadas (`features/properties`) + info inmobiliaria | static/ISR |
| `/propiedades` | filtros + listado (`features/properties`) | server + `searchParams` |
| `/propiedades/zona/[zona]` | landing de zona (`features/properties` filtrado) | estática + `generateStaticParams` |
| `/propiedades/[slug]` | detalle (`features/properties`) | ISR + `generateStaticParams` |
| `/contacto` | form (`features/leads`) | static |

### Convenciones

- **No usamos `template`** (re-monta en cada navegación). Layout alcanza: queremos preservar estado/scroll del chrome.
- Tipado: usar los helpers globales **`PageProps<'/ruta'>`** y **`LayoutProps<'/ruta'>`** (generados por Next), no tipear `params`/`searchParams` a mano.
- `searchParams` y `params` son **async** (se `await`ean) — opta la página a render dinámico cuando se usan.
