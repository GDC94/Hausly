# Lenguaje ubicuo — Glosario / diccionario maestro

Fuente de verdad del **vocabulario** del proyecto: el mapa canónico **término-español ↔
identificador-inglés** y el **significado** de cada concepto del dominio. Si una palabra del
dominio se usa en código, GROQ, UI o con el editor, su par ES↔EN se define **acá**.

Este archivo NO define estructura, tipos, validación ni reglas de negocio (eso es de
[`SANITY-SCHEMA.md`](SANITY-SCHEMA.md)), ni carpetas/rutas (eso es de
[`ARCHITECTURE.md`](ARCHITECTURE.md)). Acá viven **nombres + significado**; lo demás se linkea.

---

## 1. Regla de idioma (fuente detallada)

`CLAUDE.md` la resume; el detalle vive acá.

| Capa | Idioma | Ejemplo |
|---|---|---|
| Código, GROQ, `features/*`, componentes, funciones, variables | **Inglés** | `PropertyCard`, `features/properties`, `bedrooms` |
| Sanity — `name` de campo/type (es código: GROQ + TypeGen + frontend) | **Inglés** | `coveredArea`, `propertyType` |
| Sanity — `title` (label del editor) | **Español** | "Sup. cubierta (m²)", "Tipo" |
| URLs (SEO / mercado AR) | **Español** | `/propiedades`, `/contacto` |
| Contenido y datos (lo que carga el editor) | **Español** | "Departamento 3 ambientes en Palermo" |

Sin capa de mapeo en runtime: el editor trabaja 100% en español (vía `title`), el código 100% en
inglés (vía `name`). Este glosario es la única "traducción", y es **documental**, no ejecutable.

---

## 2. Conceptos del dominio (significado)

Qué ES cada cosa del negocio. Esto es exclusivo de este archivo.

| Identificador (EN) | Término (ES) | Significado |
|---|---|---|
| `property` | propiedad | Unidad inmobiliaria publicada (la entidad central del sitio). |
| `operation` | operación | Forma comercial de una propiedad: venta / alquiler / alquiler temporario. Una propiedad puede tener **varias a la vez**. |
| `price` | precio | Monto + moneda (USD/ARS). **Sin conversión dinámica** (Non-Goal). |
| `location` | ubicación | Dónde está: zona + dirección + punto geográfico. |
| `zone` | zona | Taxonomía geográfica (barrio/localidad) usada para **filtrar**. |
| `agency` | inmobiliaria | Documento **único** (singleton) de contacto/config; destino de los leads. |
| `lead` | consulta | Contacto de un interesado. Se **persiste como document** en Sanity (registro durable) y además **notifica** por Resend / WhatsApp. Document type → [`SANITY-SCHEMA.md §4-bis`](SANITY-SCHEMA.md). |
| `search` / filter | búsqueda / filtro | Filtrado server-side de propiedades vía `searchParams`. |
| `amenity` | amenity | Comodidad del edificio/propiedad (pileta, parrilla, …). |
| `maintenanceFee` | expensas | Gasto mensual de mantenimiento (reutiliza la forma `price`). |
| `featured` | destacada | Pin editorial: la propiedad aparece resaltada en la home. |

---

## 3. Diccionario maestro — entidades y campos (ES ↔ EN)

Mapa completo de nombres. **Tipos, validación y estructura → [`SANITY-SCHEMA.md §2–§5`](SANITY-SCHEMA.md).**

### `property` (propiedad)

| name (EN) | título (ES) |
|---|---|
| `title` | Título |
| `slug` | Slug |
| `code` | Código interno |
| `propertyType` | Tipo |
| `operations` | Operaciones |
| `description` | Descripción |
| `location` | Ubicación |
| `bedrooms` | Dormitorios |
| `bathrooms` | Baños |
| `rooms` | Ambientes |
| `coveredArea` | Sup. cubierta (m²) |
| `totalArea` | Sup. total (m²) |
| `parkingSpaces` | Cocheras |
| `age` | Antigüedad (años) |
| `condition` | Estado |
| `maintenanceFee` | Expensas |
| `amenities` | Amenities |
| `mainImage` | Imagen principal |
| `gallery` | Galería |
| `status` | Estado de publicación |
| `featured` | Destacada |
| `instagramUrl` | Instagram |

### `zone` (zona)

| name (EN) | título (ES) |
|---|---|
| `name` | Nombre |
| `slug` | Slug |
| `city` | Localidad |
| `province` | Provincia |

### `agency` (inmobiliaria)

| name (EN) | título (ES) |
|---|---|
| `name` | Nombre |
| `logo` | Logo |
| `phone` | Teléfono |
| `whatsapp` | WhatsApp |
| `email` | Email |
| `address` | Dirección |
| `socials` | Redes |

### `lead` (consulta)

| name (EN) | título (ES) |
|---|---|
| `name` | Nombre |
| `phone` | Teléfono |
| `email` | Email |
| `message` | Mensaje |
| `property` | Propiedad |
| `source` | Origen |
| `status` | Estado |

### Objetos (no-document)

| Objeto / campo (EN) | término (ES) |
|---|---|
| `operation` | operación |
| `operation.type` | Tipo de operación |
| `operation.price` | Precio |
| `price` | precio |
| `price.amount` | Monto |
| `price.currency` | Moneda |
| `location` | ubicación |
| `location.zone` | Zona |
| `location.address` | Dirección |
| `location.showAddress` | Mostrar dirección |
| `location.geopoint` | Punto geográfico |

---

## 4. Diccionario de enums (value EN ↔ title ES)

Estos valores son además **config de schema** en [`SANITY-SCHEMA.md §6`](SANITY-SCHEMA.md) — acá
como referencia de vocabulario.

| Lista | value (EN) → title (ES) |
|---|---|
| `propertyType` | `house`→Casa · `apartment`→Departamento · `ph`→PH · `land`→Terreno · `commercial`→Local · `office`→Oficina · `warehouse`→Galpón · `garage`→Cochera · `farm`→Campo |
| `operation.type` | `sale`→Venta · `rent`→Alquiler · `temporaryRent`→Alquiler temporario |
| `currency` | `USD` · `ARS` |
| `condition` | `brandNew`→A estrenar · `used`→Usado · `preConstruction`→En pozo |
| `property.status` | `available`→Disponible · `reserved`→Reservada · `sold`→Vendida · `rented`→Alquilada |
| `amenities` | `pool`→Pileta · `grill`→Parrilla · `communityRoom`→SUM · `gym`→Gimnasio · `security24h`→Seguridad 24h · `laundry`→Laundry · `solarium`→Solárium · `visitorParking`→Cochera de visitas |
| `lead.source` | `form`→Formulario · `whatsapp`→WhatsApp |
| `lead.status` | `new`→Nueva · `contacted`→Contactada · `closed`→Cerrada |

---

## 5. URLs ↔ feature / concepto

Las URLs son en español; el código en inglés. El **árbol de rutas/carpetas** es de
[`ARCHITECTURE.md`](ARCHITECTURE.md); acá solo el mapeo de vocabulario.

| URL (ES) | Feature / concepto (EN) |
|---|---|
| `/propiedades` | `features/properties` — listado + filtros |
| `/propiedades/zona/[zona]` | `features/properties` — landing por `zone` (SEO local, indexable) |
| `/propiedades/[slug]` | `features/properties` — detalle de `property` |
| `/contacto` | `features/leads` — form de `lead` |
| `/studio` | Sanity Studio (CMS embebido) |

---

## 6. Acciones / verbos

Para nombrar funciones, handlers y server actions con coherencia.

| Verbo (ES) | Identificador (EN) |
|---|---|
| filtrar | `filter` |
| buscar | `search` |
| consultar (enviar consulta) | `submitLead` |
| destacar | `feature` |
