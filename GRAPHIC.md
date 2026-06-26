# GRAPHIC — Mapa visual de la arquitectura

> **Vista derivada.** Este archivo es un *mapa* para entender el sistema de un vistazo. La **fuente
> de verdad** son los specs: si algo cambia, se cambia allá, no acá.
> Estructura y data flow → [`ARCHITECTURE.md`](ARCHITECTURE.md) · Filtros y GROQ →
> [`FILTERS.md`](FILTERS.md) · Schemas → [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md) · Stack →
> [`STACK.md`](STACK.md).
>
> ↑ **Volver:** [`PRD.md`](PRD.md) (producto · entrada) · [`CLAUDE.md`](CLAUDE.md) (índice).
>
> Diagramas en **Mermaid** con `look: handDrawn` (trazo a mano). Renderizan en GitHub, en el preview
> de Markdown del IDE y en Obsidian. Requiere Mermaid ≥ 10.9 para el trazo a mano; en visores viejos
> cae al trazo normal sin perder contenido.

---

## TL;DR — El viaje del dato (ida)

Antes de los detalles: **dónde nace el dato y dónde muere.** Ojo con la intuición — el dato **no
nace cuando el usuario entra a la web**: ya existía en Sanity desde que el editor cargó la propiedad.
El usuario solo dispara el *viaje* de ese dato hacia su pantalla.

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart LR
  s(["① ORIGEN<br/>El editor carga la<br/>propiedad en Sanity"]) --> a["② Usuario abre<br/>/propiedades"]
  a --> b["③ Next valida la URL (Zod)<br/>y arma el GROQ"]
  b --> c["④ Sanity ejecuta<br/>y devuelve los datos"]
  c --> d["⑤ RSC arma el HTML<br/>(tipado por TypeGen)"]
  d --> e(["⑥ FIN<br/>El navegador muestra<br/>las propiedades"])

  classDef origen fill:#fef3c7,stroke:#d97706,stroke-width:2px;
  classDef fin fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
  class s origen;
  class e fin;
```

- 🟡 **Origen** = Sanity (el contenido ya existía ahí antes de la visita).
- 🟢 **Fin** = el navegador del usuario.
- Hay un **segundo viaje, de vuelta**: una consulta nace en el navegador y muere guardada como `lead`
  en Sanity (ver capa 5). Esta línea es el de **ida**, el principal.

Las 5 capas siguientes hacen zoom en cada tramo.

---

## 1. Big picture — Sanity ⇄ Next ⇒ Navegador

Tres dominios. Sanity es la **fuente de contenido**; Next **renderiza server-first** y manda HTML al
navegador; el navegador solo devuelve una cosa al server: la **consulta de un lead**.

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart LR
  editor(["Editor inmobiliaria"]) -->|"carga propiedades + fotos"| studio["Sanity Studio<br/>embebido en /studio"]
  studio --> sanity[("Sanity<br/>CMS + dataset")]
  sanity -->|"contenido tipado (TypeGen)"| next["Next app<br/>src/ (App Router)"]
  next -->|"HTML server-first + next/image"| browser["Navegador"]
  browser -.->|"envía consulta (lead)"| next
  next -.->|"guarda lead + notifica"| sanity

  dev(["Dev + Sanity MCP<br/>(dev-time, NO runtime)"]) -.->|"deploy schema · seed contenido · query GROQ"| sanity

  classDef cms fill:#fef3c7,stroke:#d97706;
  classDef app fill:#dbeafe,stroke:#2563eb;
  classDef cli fill:#dcfce7,stroke:#16a34a;
  classDef tool fill:#ede9fe,stroke:#7c3aed,stroke-dasharray:4 3;
  class sanity,studio cms;
  class next app;
  class browser,editor cli;
  class dev tool;
```

> 🟣 **Sanity MCP** (línea punteada): herramienta de **dev-time / autoría**, no del runtime.
> La usamos para **deployar el schema**, sembrar contenido de ejemplo y correr queries GROQ mientras
> desarrollamos. **No** sirve props al navegador — eso lo hace `shared/sanity` (`sanityFetch`) en las
> capas siguientes. El *source* del schema sigue siendo el código (`defineType`); el MCP lo opera, no
> lo reemplaza. Detalle en [`STACK.md §2`](STACK.md).

---

## 2. El camino de las props — `/propiedades`

El flujo es **unidireccional y server-first**. La **URL es la única fuente de verdad** del estado de
búsqueda ([`ARCHITECTURE §3`](ARCHITECTURE.md), [`FILTERS §3,§4`](FILTERS.md)).

**Quién hace qué (la pregunta clave):**
- **`page.tsx` orquesta** — lee `searchParams`, llama queries, compone componentes. Nada de lógica.
- **`features/search/lib` arma los params** — parsea la URL y la valida con **Zod** (descarta basura).
- **`features/properties/queries` hace la llamada de las props** — arma el GROQ tipado con
  `defineQuery` y lo dispara vía `sanityFetch`.
- **`shared/sanity` es el cliente** — `sanityFetch` con tags de cache (ver capa 4).

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart TB
  url["URL searchParams<br/>/propiedades?operation=sale&zone=palermo&..."]
  searchlib["features/search/lib<br/>parse + valida (Zod)"]
  queries["features/properties/queries<br/>arma GROQ + defineQuery"]
  client["shared/sanity<br/>sanityFetch (cliente)"]
  sanity[("Sanity<br/>ejecuta GROQ")]
  typegen["tipos TypeGen<br/>(type-safe punta a punta)"]
  page["page.tsx (RSC)<br/>ORQUESTA"]
  comps["features/properties/components<br/>PropertyCard, PriceTag, ..."]
  html["HTML → Navegador"]

  url --> searchlib --> queries --> client --> sanity --> typegen --> page
  page --> comps --> html
  page -. "lee searchParams / params" .-> url

  classDef hot fill:#fee2e2,stroke:#dc2626,stroke-width:2px;
  class queries hot;
```

> 🔴 `features/properties/queries` (en rojo) = **el archivo que hace la llamada de las props.**
> El `page.tsx` no fetchea: orquesta. Los componentes son *presentational* (reciben props, no fetchean).

---

## 3. Render por ruta

Cada ruta elige su estrategia según SEO + frescura ([`ARCHITECTURE §4`](ARCHITECTURE.md)).

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart LR
  root["app/(site)"]
  home["/ (home)"]
  list["/propiedades"]
  zona["/propiedades/zona/[zona]"]
  detalle["/propiedades/[slug]"]
  contacto["/contacto"]

  root --> home & list & zona & detalle & contacto

  home -->|"ISR · contenido estable"| h1["static / ISR"]
  list -->|"server + searchParams<br/>cacheado por TAGS · 'Cargar más' ?offset="| l1["server-render"]
  zona -->|"generateStaticParams<br/>1 ruta por zone · SEO local"| z1["estática"]
  detalle -->|"generateStaticParams<br/>pre-genera TODO (&lt;20 props)"| d1["ISR"]
  contacto -->|"sin datos dinámicos"| c1["static"]

  classDef route fill:#dbeafe,stroke:#2563eb;
  classDef strat fill:#f3e8ff,stroke:#9333ea;
  class home,list,zona,detalle,contacto route;
  class h1,l1,z1,d1,c1 strat;
```

---

## 4. Cache + revalidación

El listado **no es full-dynamic**: se cachea por **tags** y se invalida **por contenido, no por
TTL** ([`ARCHITECTURE §4`](ARCHITECTURE.md)).

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart LR
  fetch["sanityFetch<br/>next: { tags: ['property'] }"] --> cache[("Next Data Cache<br/>vistas calientes cacheadas")]
  cache -->|"TTFB / LCP bajos"| serve["sirve /propiedades"]

  editor(["Editor publica<br/>en Sanity"]) --> webhook["app/api/revalidate/route.ts<br/>valida payload (Zod + secret)"]
  webhook -->|"revalidateTag('property')<br/>/ revalidatePath"| cache

  classDef inval fill:#fee2e2,stroke:#dc2626;
  class webhook,editor inval;
```

> Publicar una propiedad ⇒ webhook ⇒ `revalidateTag('property')` ⇒ solo esas vistas se regeneran.
> **No se espera ningún TTL.** El detalle (`[slug]`) se revalida por ruta con el mismo webhook.

---

## 5. Leads — el orden importa

El formulario captura una consulta. **Primero persiste el `lead` en Sanity, después notifica por
Resend.** Si Resend falla, el lead igual quedó guardado — un lead = posible venta, no puede depender
de un email ([`ARCHITECTURE §3`](ARCHITECTURE.md)).

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart TB
  form["LeadForm (cliente)<br/>React Hook Form + Zod (UX, errores en vivo)"]
  action["Server Action<br/>RE-VALIDA con el MISMO schema Zod"]
  lead[("(1) Sanity: guarda doc 'lead'<br/>registro durable")]
  resend["(2) Resend: notifica por email<br/>+ link de WhatsApp"]

  form -->|"submit"| action
  action ==>|"PRIMERO"| lead
  lead -->|"después"| resend

  note["Si Resend falla → el lead YA está guardado.<br/>Nunca confiar en el cliente: el server re-valida."]
  resend -.-> note

  classDef first fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
  classDef warn fill:#fef9c3,stroke:#ca8a04;
  class lead first;
  class note warn;
```

---

## Leyenda

| Color | Significa |
|-------|-----------|
| 🟡 Amarillo | Sanity / CMS (contenido) |
| 🔵 Azul | App Next / rutas |
| 🟣 Violeta | Estrategia de render |
| 🔴 Rojo | Punto crítico (la llamada de props · la invalidación de cache) |
| 🟢 Verde | Cliente / paso que persiste primero |
