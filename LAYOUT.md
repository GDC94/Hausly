# Layout — Composición visual y anatomía de páginas

> ⚠️ **Lineamiento inicial, no diseño final.** Este doc define el **punto de partida** para que el
> agente construya algo coherente de entrada, no para inventar de cero. Es una **idea / borrador
> sujeto a revisión y rediseño** del dueño del proyecto. El diseño definitivo (pixeles, ajustes finos)
> se define luego, vía Figma. **Si una decisión de acá choca con el rediseño futuro, manda el rediseño.**

Define la **composición visual**: qué secciones tiene cada página, en qué orden y con qué jerarquía.

**Límite (no chocar conceptos):**
- **NO es** el layout de *routing* — qué `layout.tsx` envuelve qué vive en [`ARCHITECTURE.md §7`](ARCHITECTURE.md).
- **NO son** los *tokens* (color, tipografía, spacing) — viven en [`DESIGN.md`](DESIGN.md).
- Acá se **referencian**, no se redefinen.

> ↑ **Volver:** [`PRD.md`](PRD.md) (producto · entrada) · [`CLAUDE.md`](CLAUDE.md) (índice).

---

## 1. Principio

- **Light + agencia.** Paleta light de [`DESIGN.md §1`](DESIGN.md) (sin dark mode). La marca es la
  **inmobiliaria**, no una persona — sin perfiles de agente.
- **Densidad editorial.** Mucho aire, **la imagen es la protagonista** (es el producto). Jerarquía
  clara con la escala tipográfica de [`DESIGN.md §2`](DESIGN.md).
- **Ancho.** Todo dentro de `--container-max` (1280px) con `--container-padding`, salvo **heros y
  footer** que van full-bleed.
- **Imágenes.** Siempre el patrón anti-deformación de [`DESIGN.md §9`](DESIGN.md): contenedor con
  `aspect-ratio` (token) + `<Image fill>` + `object-cover`. Nunca se estira.

---

## 2. Chrome global

En el shell `(site)` ([`ARCHITECTURE.md §7`](ARCHITECTURE.md)). Presente en todas las páginas públicas.

### Header (sticky)

```
+--------------------------------------------------------------+
| [logo]        Inicio   Propiedades   Contacto      [CTA] [≡] |
+--------------------------------------------------------------+
```

- Superficie light, `border-bottom` sutil (`--border`). Sticky al hacer scroll.
- Nav: Inicio · Propiedades · Contacto. CTA a la derecha (Contacto / WhatsApp).
- Mobile: nav colapsa a menú (`≡`).

### Footer (full-bleed)

```
+==============================================================+
|  superficie --primary (near-black)                           |
|  [logo agencia]                                              |
|  Propiedades   Zonas   Inmobiliaria   Contacto               |
|  NAP (dirección · tel · email)        [WhatsApp]  [Google ★] |
|  --------------------------------------------------          |
|  © 2026 · redes                                              |
+==============================================================+
```

- **El look "oscuro" de la referencia se logra con `--primary`** — la superficie near-black que YA
  está en la paleta ([`DESIGN.md §1`](DESIGN.md)). **No requiere dark mode.**
- Columnas de links + **NAP de la `agency`** ([`SANITY-SCHEMA.md`](SANITY-SCHEMA.md)) + **botón
  WhatsApp** (canal de leads, [`STACK.md`](STACK.md)) + "Opiniones en Google" + redes.

### Banner de consentimiento

Chrome global (aparece hasta que el visitante decide). **Accesible** (focuseable, teclado, contraste
AA, foco visible) y **sin CLS** (overlay / espacio reservado — no rompe CWV). Detalle del consentimiento
y su efecto en analytics → [`ANALYTICS.md §6`](ANALYTICS.md).

---

## 3. Home `/`

Arranque **híbrido**: impacto visual + búsqueda inmediata.

```
+--------------------------------------------------------------+
|  HEADER                                                      |
+--------------------------------------------------------------+
|  [ HERO imagen full-bleed + overlay ]                        |
|     "Encontrá tu próxima propiedad"        (text-display)    |
|     [ Operación | Zona | Precio        →  Buscar ]           |
+--------------------------------------------------------------+
|  DESTACADAS                                                  |
|     [card]   [card]   [card]                                 |
+--------------------------------------------------------------+
|  POR QUÉ NOSOTROS   (bento)                                  |
|     [15 años] [90+ vendidas] [N zonas] [value props...]     |
+--------------------------------------------------------------+
|  CTA contacto                                                |
+--------------------------------------------------------------+
|  FOOTER                                                      |
+--------------------------------------------------------------+
```

- **Hero**: imagen (`--aspect-hero` o viewport) + overlay + titular `text-display` + **barra de
  búsqueda compacta**. La búsqueda **navega a `/propiedades?operation=…&zone=…`** — es un *entry*, no
  estado de cliente duplicado (la URL es la única fuente de verdad, [`FILTERS.md §3`](FILTERS.md)).
- **Destacadas**: grid de `PropertyCard` (§4). *Nota: "destacadas" puede requerir un flag `featured`
  en `property`; si no existe, se decide al tocar el schema — no se asume acá.*
- **Por qué nosotros** (bento, en clave **agencia**): tiles de stats (años, propiedades vendidas,
  zonas cubiertas) + value props. Sin foto ni persona.

---

## 4. Anatomía de `PropertyCard`

El **átomo** reusado en destacadas, listado, zona y "cercanas". **Una sola card, sin variantes.**

```
+---------------------------+
| [ imagen  --aspect-card ] |
|  (pill: Venta / Nueva)    |
+---------------------------+
|  Título                   |
|  Zona                     |
|  3 amb · 2 baños · 120 m² |
|  USD 180.000 · ARS …      |
+---------------------------+
```

- Imagen: contenedor `--aspect-card` (4/3) + `<Image fill object-cover>` ([`DESIGN.md §9`](DESIGN.md)).
- **Pill de estado** overlay (operación o "nueva").
- Debajo: título · zona · specs (amb · baños · m²) · **precio dual USD/ARS**
  ([`FILTERS.md §2`](FILTERS.md), [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md)).
- Toda la card es un link al detalle. Tap target ≥44px ([`SEO.md`](SEO.md)).

---

## 5. Listado `/propiedades`

```
+--------------------------------------------------------------+
|  Propiedades                                                 |
|  [ Operación ▸ Moneda ▸ Precio | Zona | Tipo | ... ]         |  ← filtros (revelado inline)
|  124 propiedades                                             |  ← contador (aria-live)
+--------------------------------------------------------------+
|   [card]   [card]   [card]                                   |
|   [card]   [card]   [card]                                   |
|                  [ Cargar más ]                              |
+--------------------------------------------------------------+
```

- **Barra de filtros arriba** con **revelado inline** operación→moneda→precio ([`FILTERS.md §5`](FILTERS.md)).
  Los filtros son **componente compartido**, no layout ([`ARCHITECTURE.md §7`](ARCHITECTURE.md)).
- **Contador** de resultados con `aria-live="polite"`.
- **Grid editorial** responsive (§9) + botón **"Cargar más"** (`?offset=`, URL crawleable — no infinite
  scroll, [`FILTERS.md §5`](FILTERS.md)).

---

## 6. Zona `/propiedades/zona/[zona]`

Igual que el listado, **+ intro de zona arriba** para SEO local.

```
+--------------------------------------------------------------+
|  Propiedades en {Zona}                                       |
|  {descripción de la zona}                 · 18 propiedades   |
+--------------------------------------------------------------+
|  [ filtros ]                                                 |
|  [card] [card] [card] ...   [ Cargar más ]                  |
+--------------------------------------------------------------+
```

- **Intro de zona** (nombre + descripción + conteo): contenido indexable para SEO local
  ([`SEO.md §7`](SEO.md)). Los filtros siguen disponibles.

---

## 7. Detalle `/propiedades/[slug]`

Patrón **Airbnb**: galería protagonista + contenido a la izquierda + card de contacto sticky a la derecha.

```
+--------------------------------------------------------------+
|  HERO photo-grid:   [   grande   ] [chica][chica]            |
|                     [   grande   ] [chica][chica]            |
|                                     [ Ver todas las fotos ]  |
+--------------------------------------------------------------+
|  Título · código · Zona / dirección · 3 amb · 2 baños · m²   |
+----------------------------------------+---------------------+
|  CONTENIDO (izq)                       |  CARD CONTACTO (der) |
|   · Recorrido por categorías           |   USD 180.000        |
|     (Comedor, Baños, Dormitorios...)   |   ARS …              |
|   · Descripción                        |   [ Consultar ]      |
|   · Características                     |   [ WhatsApp ]       |
|   · Amenities                          |   (sticky)           |
|   · Qué tenés que saber                |                     |
+----------------------------------------+---------------------+
|  ¿Dónde queda?   [ mapa ESTÁTICO ]  dirección · ver en Maps  |
+--------------------------------------------------------------+
|  Propiedades cercanas   [card] [card] [card] →               |
+--------------------------------------------------------------+
```

- **Hero photo-grid**: 1 grande + 4 chicas (desktop) → "Ver todas las fotos" abre galería; mobile =
  carrusel.
- **Dos columnas (desktop)**: izquierda = contenido (recorrido por categorías, descripción,
  características, amenities, "qué saber"); derecha = **card de contacto sticky** (precio dual USD/ARS +
  CTA de consulta + WhatsApp). Es el equivalente a la "booking card" de Airbnb, pero para **captar lead**.
- **Mapa estático** ([`STACK.md`](STACK.md)): imagen estática + dirección + link a Google Maps en tab
  nuevo. **NO interactivo** (decisión de CWV/a11y).
- **Carrusel "cercanas/similares"**: reusa `PropertyCard` (§4).

---

## 8. Contacto `/contacto`

```
+--------------------------------------------------------------+
|  Contacto                                                    |
+------------------------------+-------------------------------+
|  FORM de lead                |  NAP de la agencia            |
|   nombre · contacto · msg    |   dirección · tel · email     |
|   [ Enviar ]                 |   [ WhatsApp ]                |
|                              |   [ mapa estático oficina ]   |
+------------------------------+-------------------------------+
|  FOOTER                                                      |
+--------------------------------------------------------------+
```

- Form de lead (`features/leads`) + NAP de la `agency` + WhatsApp + mapa estático de la oficina.

---

## 9. Responsive / densidad

Breakpoints de [`DESIGN.md §6`](DESIGN.md).

| Zona | Mobile | `md` (768) | `lg` (1024) |
|------|--------|-----------|-------------|
| Grid de cards | 1 col | 2 col | 3 col |
| Detalle | 1 col (card de contacto baja al final) | 1 col | 2 col (card **sticky**) |
| Hero home | imagen + búsqueda apilada | búsqueda en línea | búsqueda en línea |
| Bento "por qué" | apilado | 2 col | mosaico (tiles mixtos) |

- Mobile-first. Tap targets ≥44px, foco visible y orden de teclado lógico ([`SEO.md`](SEO.md)).
