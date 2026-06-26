# SEO & Accesibilidad — Sitio inmobiliaria

Guía accionable de **SEO** (técnico, on-page, local/geo), **GEO** (Generative Engine Optimization) y
**Accesibilidad**. Cada ítem etiquetado **[código]** (lo construimos / lo cubren los specs) o
**[operación]** (mantenimiento continuo, no es código: contenido, backlinks, GBP).

> **Verdad de entrada (no la olvides):** "SEO 100%" **no existe como número**. Lighthouse SEO=100 es
> el **piso técnico**, no garantía de ranking. Rankear es competitivo y el algoritmo es opaco:
> controlás lo técnico (100%), influís en lo competitivo (contenido/autoridad). Mismo criterio en GEO.

Fuentes únicas relacionadas: tokens en [`DESIGN.md`](DESIGN.md); nombres de campos/enums en
[`DOMAIN.md`](DOMAIN.md) / [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md); rendering (ISR) en
[`ARCHITECTURE.md`](ARCHITECTURE.md). Acá viven las **reglas SEO + el estándar a11y + el shape JSON-LD**.

---

## 1. Principios

- **Smart defaults con override opcional** — no exigir campos SEO; derivar del contenido existente.
- **Lógica de fallback en GROQ** (`coalesce`), no en componentes.
- **APIs nativas de Next** — `generateMetadata`, `app/sitemap.ts`, `app/robots.ts`. Nunca `<meta>` a mano.
- **Contenido estructurado = datos estructurados** — el modelo de dominio ya es SEO-ready.
- `lang="es-AR"` en `<html>` (mercado/idioma).

---

## 2. Metadata por ruta — [código]

`generateMetadata` con **`stega: false`** (los caracteres stega en `<title>` destruyen el SEO).
Deriva de los campos existentes de `property` vía `coalesce` (decisión: **sin objeto `seo` en el schema**).

```ts
// app/(site)/propiedades/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const property = await getProperty(await params); // sanityFetch, stega:false
  if (!property) return {};
  return {
    title: property.title,                              // template aplica " | <agency.name>"
    description: truncate(property.descriptionPlain, 155), // pt::text(description) en GROQ
    alternates: { canonical: `/propiedades/${property.slug}` },
    openGraph: { type: "website", images: [ogImage(property)] },
    twitter: { card: "summary_large_image" },
    // robots: status no indexable → noindex (ver abajo)
  };
}
```

- **Title template** a nivel layout: `` { template: "%s | <agency.name>", default: "<agency.name>" } ``.
- **Description**: `pt::text(description)` en la query → texto plano recortado (~155 char).
- **Canonical** en cada página (evita duplicados por querystring de filtros).
- **`robots: noindex`** para propiedades no publicables: por defecto **indexar `available`**;
  evaluar `noindex` para `sold`/`rented`/`reserved` (no rankear lo que no se vende).
- Open Graph + Twitter `summary_large_image`.

---

## 3. Open Graph image — [código]

- Default: `mainImage` vía image-url builder a **1200×630** (`urlFor(mainImage).width(1200).height(630)`).
- Fallback dinámico: **`/api/og`** (Edge `ImageResponse`) cuando falte imagen.
- Decisión: **no se sube imagen SEO aparte** — se deriva del contenido.

---

## 4. JSON-LD — datos estructurados — [código]

Type-safe con **`schema-dts`**. Inyectar como `<script type="application/ld+json">`. GROQ usa
`pt::text()` para texto plano. Tres tipos:

### 4.1 `RealEstateListing` (detalle de propiedad)
schema.org: `RealEstateListing` (WebPage→CreativeWork) **envuelve `Offer`s**.

- Página: `RealEstateListing` → `datePosted` (`_createdAt`), `url`, `name` (title), `description`, `image[]`.
- **Una `Offer` por cada `operation`** (resuelve el caso doble-operación):
  - `businessFunction`: GoodRelations `http://purl.org/goodrelations/v1#Sell` (venta) /
    `#LeaseOut` (alquiler / alquiler temporario).
  - `price` + **`priceCurrency`** (USD | ARS) → venta USD + alquiler ARS = **dos Offers** distintas.
  - `availability` desde `status`.
  - `itemOffered`: `Apartment` / `House` (mapeo desde `propertyType`) con `numberOfBedrooms`,
    `numberOfBathroomsTotal`, `floorSize` (`QuantitativeValue`, m² desde `coveredArea`),
    `address` (`PostalAddress` desde `location`), `geo` (`GeoCoordinates` desde `geopoint`).

### 4.2 `RealEstateAgent` / `Organization` (global, desde el singleton `agency`)
`name`, `logo`, `telephone`, `address` (`PostalAddress`), `geo`, `areaServed` (zonas), `sameAs` (redes).

### 4.3 `BreadcrumbList`
Inicio › Propiedades › [zona] › [propiedad]. Mejora navegación y rich results.

> Validar siempre con Rich Results Test + Schema Markup Validator (ver §9).

---

## 5. Sitemap + robots — [código]

- **`app/sitemap.ts`**: GROQ sobre `property` (slug + `_updatedAt`, solo indexables) y landings de
  `zone`; `lastModified = _updatedAt`, `changeFrequency`/`priority` por tipo. Límite 50k URLs/archivo
  (lejísimos).
- **`app/robots.ts`**: apunta al sitemap; **permite bots IA** (ver §8 GEO).

---

## 6. Accesibilidad — estándar (barra dura) — [código]

Meta NO negociable: **100% Lighthouse a11y + 100% navegable por teclado**. Checklist accionable:

- [ ] **Landmarks** semánticos: `header` / `nav` / `main` / `footer` (alineado al `(site)` layout de
      ARCHITECTURE). Un solo `h1` por página; jerarquía de headings sin saltos.
- [ ] **Skip-link** "Saltar al contenido" como primer elemento focuseable.
- [ ] **Teclado**: orden de tab lógico; todo lo interactivo alcanzable y operable; **focus trap** en
      menú móvil / modales; `Esc` cierra overlays.
- [ ] **Foco visible**: `:focus-visible` (ya definido en `DESIGN.md` globals, `--ring`).
- [ ] **Filtros**: contenedor de resultados con `aria-live="polite"` (cambian sin recargar).
- [ ] **Form de lead**: `<label>` asociado a cada input; errores con `aria-describedby` +
      `aria-invalid` (encaja con React Hook Form + Zod del STACK); `aria-required`.
- [ ] **Tap targets ≥ 44×44px** (mobile).
- [ ] **`alt`** en toda imagen (ya **requerido** en el schema, `SANITY-SCHEMA.md`); `alt=""` solo decorativas.
- [ ] **`prefers-reduced-motion`** respetado (ya en `DESIGN.md §8`; GSAP bajo `matchMedia`).
- [ ] **Contraste** WCAG AA (**4.5:1** texto / **3:1** large+UI). **Resuelto**: `--muted-foreground` =
      slate `#4E5257` (**7.87:1**). Regla: `#8D9499` (`--color-gray`) **NUNCA** en texto chico, solo
      UI/bordes/texto grande. Valor del token → `DESIGN.md §1`.

---

## 7. SEO local / geo (inmobiliaria — alto ROI)

El de mayor retorno para el negocio: clientes de la zona.

- [ ] **Google Business Profile** completo y verificado — **[operación]**.
- [ ] **NAP consistente** (Name / Address / Phone idénticos en sitio + GBP + directorios). Fuente
      única: el singleton `agency` — **[código]** en el sitio / **[operación]** en directorios.
- [ ] JSON-LD `RealEstateAgent` / `LocalBusiness` con `address`, `geo`, `areaServed` (zonas), `sameAs`
      — **[código]** (§4.2).
- [ ] **Landing pages por zona** ("Departamentos en Palermo"): ruta **estática propia**
      `/propiedades/zona/[zona]` (`generateStaticParams` desde `zone`), `title`/`h1` geográfico y
      **canonical auto-referente** (NO a `/propiedades`). Es un eje finito de alto valor → URL real e
      indexable, no querystring (el filtro libre por `searchParams` sí va `noindex`). En el sitemap.
      Árbol de rutas en [`ARCHITECTURE.md §2,§4`](ARCHITECTURE.md); acá el porqué SEO — **[código]**.
- [ ] **Keywords geográficas** en title/H1/contenido — **[operación]**.
- [ ] **Reseñas** reales en GBP — **[operación]**.

---

## 8. GEO — Generative Engine Optimization (aparecer en IA)

Que las IAs (ChatGPT, Perplexity, Gemini, Google AI Overviews, Claude) te **citen**.

- [ ] **Permitir bots IA** en `robots.txt`: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`
      (si los bloqueás, no hay cita) — **[código]**.
- [ ] **`llms.txt`** en la raíz: mapa del sitio para LLMs — **[código, apuesta especulativa de bajo
      costo]**. ⚠ **No es palanca probada**: casi ningún proveedor de LLM confirmó que lo consume. Se
      hace **solo porque cuesta casi nada** (archivo estático **auto-generado** del mismo dato del
      `sitemap`, cero mantenimiento manual). **Prioridad: la más baja del GEO** — si hay que cortar por
      tiempo, se corta sin culpa. Las palancas GEO **reales** son permitir bots IA (arriba) + JSON-LD +
      datos duros, no esto.
- [ ] **Contenido extractable / citable**: respuestas directas, listas, tablas, Q&A (la IA copia
      *chunks*) — **[operación]**.
- [ ] **Datos duros** (precios, m², fechas) + **JSON-LD reutilizado** (las máquinas parsean estructura,
      no estética) — **[código]** + **[operación]**.
- [ ] **Entidad consistente** (misma NAP/marca), **frescura** (`_updatedAt`), **autoridad** (se solapa
      con E-E-A-T) — **[operación]**.

> SEO y GEO se solapan **~80%**: HTML semántico + JSON-LD + autoridad + frescura sirven a los dos.
> La diferencia GEO: escribir para ser **extraíble como cita**, no para un clic.

---

## 9. Medición / herramientas

Separá **LAB** (pre-deploy, en tu máquina/CI) de **CAMPO** (post-deploy, usuarios reales = fuente de
verdad). **Clave**: los Core Web Vitals que Google **rankea** son de **campo** (CrUX/GSC), NO el
número lab de Lighthouse.

### Lab (antes de publicar)
- **Lighthouse** — SEO técnico + A11y + CWV lab. Disponible ya vía **chrome-devtools MCP**
  (`lighthouse_audit`).
- **Lighthouse CI (`lhci`)** — **gate** en el pipeline: bloquea el merge si a11y < 100. Convierte el
  requisito en regla, no en aspiración.
- **Rich Results Test** + **Schema Markup Validator** — validar el JSON-LD `RealEstateListing`.
- **axe DevTools / WAVE / Pa11y** + **teclado y screen reader (VoiceOver) manual** — Lighthouse solo
  detecta ~30% de los problemas de a11y; el resto es manual.

### Campo (después de publicar — fuente de verdad)
- **Google Search Console** — OBLIGATORIO: indexación, queries, posición, CWV reales (CrUX), sitemap,
  penalizaciones.
- **PageSpeed Insights** — CWV lab + campo.
- **Vercel Speed Insights** — CWV de campo nativo del deploy.

### Auditoría de sitio
- **Screaming Frog** (gratis ≤500 URLs) — crawl, links rotos, títulos duplicados, profundidad.
- **Ahrefs / Semrush** (pagos) — backlinks, keywords, rank tracking (lo competitivo).

### GEO (medición todavía primitiva — honesto)
- Prueba **manual**: preguntar en ChatGPT/Perplexity/Gemini/Claude y ver si te citan (Perplexity
  muestra fuentes).
- **Logs del server**: confirmar que `GPTBot`/`PerplexityBot`/`ClaudeBot` crawlean.
- Herramientas emergentes (Otterly.ai, Peec.ai) — pagas e inmaduras, no confiables aún.

---

## 10. Checklist consolidado — "el mejor SEO + GEO posible"

| Grupo | Ítem | Tipo |
|---|---|---|
| **Técnico** | HTTPS, HTTP/2, CDN, ISR/revalidate (`ARCHITECTURE §4`) | [código] |
| | `sitemap.ts` + `robots.ts` + `canonical` por página | [código] |
| | Core Web Vitals verdes (LCP/INP/CLS) — lab + campo | [código]+[operación] |
| | URLs limpias en español, 301 en cambios, sin links rotos | [código] |
| **On-page** | `title` único + meta description por ruta (`generateMetadata`) | [código] |
| | UN `h1`, jerarquía de headings, HTML semántico | [código] |
| | `next/image` (AVIF/WebP, lazy, `alt`) — `DESIGN §9` | [código] |
| | Open Graph + Twitter cards | [código] |
| | JSON-LD `RealEstateListing` + `BreadcrumbList` | [código] |
| **Contenido** | Match de intención de búsqueda, profundidad, E-E-A-T | [operación] |
| | Frescura (`_updatedAt`, propiedades al día) | [operación] |
| **Local** | GBP verificado + reseñas | [operación] |
| | NAP consistente (fuente: `agency`) | [código]+[operación] |
| | JSON-LD `RealEstateAgent` (`geo`/`areaServed`) | [código] |
| | Landing por zona + keywords geográficas | [código]+[operación] |
| **GEO** | `robots.txt` permite bots IA + `llms.txt` | [código] |
| | Contenido extractable + datos duros + JSON-LD | [código]+[operación] |
| **A11y** | 100% Lighthouse + 100% teclado (checklist §6) | [código] |
| | Contraste WCAG AA (`--muted-foreground` = `#4E5257`) | [código] |
| **Medición** | GSC + sitemap submit (campo) | [operación] |
| | Lighthouse CI gate a11y=100 (lab) | [código] |
| | Validar JSON-LD (Rich Results Test) | [operación] |
