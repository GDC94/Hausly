# Filtros de búsqueda — Catálogo

Fuente de verdad del **catálogo de filtros**: qué se filtra, con qué `searchParam`, contra qué campo
del schema y con qué predicado GROQ. El **mecanismo** (cómo fluyen: `searchParams` → Zod → GROQ →
RSC; filtros = componente, no layout) vive en [`ARCHITECTURE.md §3, §7`](ARCHITECTURE.md). Campos y
enums en [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md); nombres en [`DOMAIN.md`](DOMAIN.md); a11y de
resultados en [`SEO.md §6`](SEO.md).

**Idioma de los params**: en **inglés** con valores de enum **canónicos** (`operation=sale`,
`currency=USD`, `rooms=3`); `zone` por slug. Razón: los query params son **código** (los parsea Zod),
igual que el `name` de Sanity. La regla "URLs en español" aplica a los **segmentos de ruta**
(`/propiedades/[slug]`), no a los params funcionales — así evitamos una capa de mapeo.

---

## 1. Catálogo

| Filtro | `searchParam` | Tipo / encoding | Campo (schema) | Predicado GROQ |
|---|---|---|---|---|
| Operación | `operation` | enum `sale\|rent\|temporaryRent` | `operations[].type` | combinado → §2 |
| Moneda | `currency` | enum `USD\|ARS` | `operations[].price.currency` | combinado → §2 |
| Precio mín | `priceMin` | number | `operations[].price.amount` | combinado → §2 |
| Precio máx | `priceMax` | number | `operations[].price.amount` | combinado → §2 |
| Tipo | `type` | enum (propertyType), multi (coma) | `propertyType` | `propertyType in $types` |
| Zona | `zone` | slug(s), multi (coma) | `location.zone->slug.current` | `location.zone->slug.current in $zones` |
| Ambientes | `rooms` | number (mín; "4+"→4) | `rooms` | `rooms >= $rooms` |
| Baños | `bathrooms` | number (mín) | `bathrooms` | `bathrooms >= $bathrooms` |
| Superficie mín | `areaMin` | number (m²) | `coveredArea` | `coveredArea >= $areaMin` |
| Superficie máx | `areaMax` | number (m²) | `coveredArea` | `coveredArea <= $areaMax` |
| Cocheras | `parking` | number (mín) | `parkingSpaces` | `parkingSpaces >= $parking` |
| Estado | `condition` | enum, multi (coma) | `condition` | `condition in $conditions` |
| Amenities | `amenities` | enum, multi (coma) | `amenities` | `count(amenities[@ in $amenities]) == count($amenities)` (AND) |
| Texto | `q` | string | `title` / `code` / `location.address` | `title match $q \|\| code match $q \|\| location.address match $q` |
| Orden | `sort` | enum `newest\|priceAsc\|priceDesc\|areaDesc` | — | `order(...)` → §4 |

> Valores de enum (propertyType, condition, amenities, operation.type, currency) salen tal cual de
> [`SANITY-SCHEMA.md §6`](SANITY-SCHEMA.md). No se inventan.

**Controles UI** (en `features/search/components/`, primitivas shadcn): Operación = tabs/segmented;
Moneda = toggle USD/ARS; Precio = dos inputs numéricos; Tipo / Zona / Estado / Amenities =
multi-select (checkbox/combobox); Ambientes / Baños / Cocheras = stepper o pills "1·2·3·4+";
Superficie = dos inputs; Texto = input; Orden = select.

---

## 2. Precio + moneda + operación (la parte crítica)

Una propiedad puede tener **varias operaciones** (venta en USD **y** alquiler en ARS) y **no hay
conversión** (Non-Goal). Por eso `operation`, `currency`, `priceMin` y `priceMax` deben evaluarse
sobre el **MISMO elemento** del array `operations` — nunca cruzados:

```groq
count(operations[
  (!defined($operation) || type == $operation) &&
  (!defined($currency)  || price.currency == $currency) &&
  (!defined($priceMin)  || price.amount >= $priceMin) &&
  (!defined($priceMax)  || price.amount <= $priceMax)
]) > 0
```

Por qué así:
- **Sub-filtro sobre el array, no cross-operation.** "Venta hasta USD 200.000" debe matchear una
  propiedad cuya **operación de venta en USD** cumpla el rango — NO una que tenga un alquiler en ARS
  barato y una venta en USD carísima. Evaluar contra el mismo elemento lo garantiza.
- **`currency` es filtro explícito**, no derivado: cuando una propiedad está en ambas monedas, el
  sistema no puede "adivinar" cuál querés. Vos elegís. (Recordatorio del schema: `sale` tiene
  `currency` con `initialValue: 'USD'` pero **editable** —no readOnly—; `rent`/`temporaryRent`
  pueden ser USD o ARS. Ver `SANITY-SCHEMA.md §5`.)
- **`priceMin/Max` sin `currency` no tiene sentido** → la UI habilita precio recién cuando hay
  moneda (y normalmente operación). Sin esos, se ignora el rango.

---

## 3. Contrato de `searchParams` (Zod)

El **schema Zod de parseo** vive en `features/search/` (parse en `lib/`, shape en `schemas/`). El
**tipo** que produce — `PropertyFilters`, el objeto de filtros validado — es el **contrato compartido**
entre search y properties, así que vive en `shared/types` (no en un feature; ver
[`ARCHITECTURE.md §2, §3`](ARCHITECTURE.md)). Reglas:

- **Coerción**: números con `z.coerce.number()`; negativos/NaN → se descartan.
- **Enums** validados contra las listas de `SANITY-SCHEMA §6`; valor inválido → se ignora (no rompe).
- **Multi-valor** por coma: `type=apartment,ph` · `zone=palermo,belgrano` · `amenities=pool,grill`.
- **Defaults**: `status` implícito = `available` (no es param de usuario); `sort` = `newest`.
- **Tolerante**: params desconocidos o mal formados se ignoran; la página siempre renderiza.
- **URL = única fuente de verdad** del estado de búsqueda (sin estado de cliente duplicado;
  `ARCHITECTURE §3`). Cambiar un filtro = navegar a otra URL.

---

## 4. Ensamblado de la query GROQ

Los params validados se componen en **UNA** query filtrada con predicados condicionales (`defined()`),
tipada con `defineQuery` (TypeGen). El bloque base siempre incluye `status`:

```groq
*[_type == "property"
  && status == "available"
  && (!defined($types)      || propertyType in $types)
  && (!defined($zones)      || location.zone->slug.current in $zones)
  && (!defined($rooms)      || rooms >= $rooms)
  && (!defined($bathrooms)  || bathrooms >= $bathrooms)
  && (!defined($areaMin)    || coveredArea >= $areaMin)
  && (!defined($areaMax)    || coveredArea <= $areaMax)
  && (!defined($parking)    || parkingSpaces >= $parking)
  && (!defined($conditions) || condition in $conditions)
  && (!defined($amenities)  || count(amenities[@ in $amenities]) == count($amenities))
  && (!defined($q)          || title match $q || code match $q || location.address match $q)
  && count(operations[
       (!defined($operation) || type == $operation) &&
       (!defined($currency)  || price.currency == $currency) &&
       (!defined($priceMin)  || price.amount >= $priceMin) &&
       (!defined($priceMax)  || price.amount <= $priceMax)
     ]) > 0
] | order(<sort>)
```

- **Quién hace qué (un solo dueño del GROQ):** `features/search/lib` **produce el objeto
  `PropertyFilters`** validado (y nada más); `features/properties/queries` **lo convierte en GROQ +
  bindings + fetch**. El ensamblado de la query vive solo en properties, nunca en search.
- **`sort`**: `newest` → `order(_createdAt desc)`; `areaDesc` → `order(coveredArea desc)`;
  `priceAsc/Desc` solo es coherente **dentro de una moneda** → si no hay `currency`, cae a `newest`
  (no se puede ordenar precios USD y ARS juntos sin conversión).
- **Lotes ("Cargar más")**: la query trae un lote acotado con slice `[$offset...$end]` (tamaño de
  lote fijo). Cada lote es una **URL crawleable** (`?offset=24`), server-rendered. Comportamiento UX
  → §5. Con <20 propiedades (volumen de lanzamiento, ver `ARCHITECTURE §4`) probablemente entra todo
  en uno o dos lotes y el botón casi no aparece — pero el patrón queda listo para crecer.

### Text-search `q` — alcance (decisión MVP = opción A)

`q` es un filtro **secundario**: el laburo pesado lo hacen las facetas estructuradas (zona, tipo,
ambientes), que son exactas. La cajita libre es best-effort. `match` de GROQ es literal y tiene dos
límites:

- **Parcial**: `match` tokeniza por palabra → "palerm" NO matchea "Palermo" sin wildcard.
- **Acentos**: `match` NO foldea diacríticos → "nunez" NO matchea "Núñez". El usuario no tipea tildes.

**Opción A — MVP (elegida).** Wildcard de prefijo: el predicado usa `$q + "*"`
(`title match $q || code match $q || location.address match $q`, con el `*` aplicado al término).
Resuelve el parcial. **Acentos = limitación conocida y aceptada**: si el usuario tipea sin tilde,
puede no encontrar; se lo empuja a las facetas. Cero infraestructura extra.

**Opción B — futura (cuando el uso lo justifique).** Campo derivado `searchText` en el schema:
copia de `title` + `address` **foldeada** (sin diacríticos, lowercase, vía slugify/normalize). `q`
matchea contra `searchText` y al input se le aplica la misma normalización antes de comparar →
"nunez" encuentra "Núñez", resuelto de raíz sin depender de que GROQ foldee. Costo: un campo más +
lógica de normalización en el pipeline de ingreso. **No se construye en MVP** (YAGNI): se suma solo
si el buscador libre demuestra uso real.

---

## 5. Comportamiento UX

- **Server-render por combinación, cacheado por tags**: cada set de filtros = una URL
  server-rendered; la query NO es full-dynamic. La **estrategia de cache** (`sanityFetch` + tags +
  `revalidateTag` en el webhook, invalidación por contenido no por TTL) es decisión de rendering y
  vive en [`ARCHITECTURE.md §4`](ARCHITECTURE.md) — acá solo el comportamiento UX. `searchParams`
  sigue siendo la única fuente de verdad del estado.
- **Contador de resultados** visible; **filtros activos como chips** removibles (cada chip quita su param).
- **Estado vacío**: "No encontramos propiedades con esos filtros" + acción de **reset** (limpia params).
- **Revelado contextual del precio (inline)**: el bloque de precio se muestra **progresivamente** —
  sin operación, deshabilitado; al elegir operación aparece la **moneda**; al elegir moneda aparece
  el **slider**. El revelado es **inline**: el bloque se expande en su lugar y empuja suave lo de
  abajo, con transición `motion-safe` (NO acordeón — la revelación contextual ya es la compactación;
  un acordeón sería colapsar lo ya colapsado). Tokens de motion → [`DESIGN.md §8`](DESIGN.md). El
  porqué del embudo operación→moneda→precio → §2.
- **"Cargar más" (no infinite scroll)**: el listado pagina por lotes con un **botón "Cargar más"**
  que trae el siguiente lote (URL crawleable `?offset=`, ver §4) y lo **agrega abajo**. Auto-disparo
  al acercarse al final = **enhancement opcional** (IntersectionObserver) **siempre con el botón real
  de fallback**. **No se usa infinite scroll puro** porque rompe cuatro no-negociables del proyecto:
  SEO (contenido tras JS sin URL → el bot no lo indexa), a11y (foco perdido + **footer inalcanzable**),
  CWV (DOM sin límite → INP/CLS), y "URL = fuente de verdad" (rompe el botón atrás y el deep-linking).
  El botón es focuseable y el footer queda alcanzable.
- **a11y**: el contenedor de resultados con `aria-live="polite"` para anunciar el cambio sin recargar
  (incluye los lotes nuevos del "Cargar más"); foco y teclado según [`SEO.md §6`](SEO.md). Tap
  targets ≥44px.
