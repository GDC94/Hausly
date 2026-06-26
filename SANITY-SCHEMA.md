# Modelo de dominio — Schemas de Sanity

Modelo de dominio concreto del proyecto. Glosario término-español ↔ identificador-inglés en [`DOMAIN.md`](DOMAIN.md). Render de imágenes en [`DESIGN.md`](DESIGN.md); estructura en [`ARCHITECTURE.md`](ARCHITECTURE.md).

**Regla de idioma**: el `name` de cada campo/type va en **inglés** (es código: GROQ + TypeGen + frontend). El `title` (label del editor) va en **español**. El editor trabaja 100% en español; el código, 100% en inglés. Sin capa de mapeo.

Document types: `property`, `zone`, `agency`, `lead`.

---

## 1. Convenciones (best practices Sanity)

- Siempre `defineType` / `defineField` / `defineArrayMember` (type-safe).
- Icono de `@sanity/icons` en cada document/object.
- **Modelar qué ES la cosa, no cómo se ve** (data > presentación).
- **`reference`** para lo reusable e independiente (ej. `zone`); **`object`** para lo propio del documento (ej. `location`, `price`).
- Imágenes: `hotspot: true` + campo `alt`. LQIP vía `asset->{ metadata { lqip } }`.
- Estados con `options.list` (`{ title: 'Español', value: 'englishValue' }`); no booleans, salvo flags binarios genuinos (`featured`, `showAddress`).
- Validación con `rule` (required, min/max, uri, custom async para slug único).

---

## 2. `property` — documento principal

`title` (label editor) en español, `name` en inglés.

| name | Title (editor) | Tipo | Notas |
|---|---|---|---|
| `title` | Título | `string` | required |
| `slug` | Slug | `slug` | source `title`; único (validación async) |
| `code` | Código interno | `string` | opcional |
| `propertyType` | Tipo | `string` list | ver §6 |
| `operations` | Operaciones | `array<operation>` | min 1; `type` único en el array |
| `description` | Descripción | `array` (Portable Text) | texto rico |
| `location` | Ubicación | `location` (object) | incluye `geopoint` |
| `bedrooms` | Dormitorios | `number` | fieldset "Características" |
| `bathrooms` | Baños | `number` | |
| `rooms` | Ambientes | `number` | |
| `coveredArea` | Sup. cubierta (m²) | `number` | |
| `totalArea` | Sup. total (m²) | `number` | |
| `parkingSpaces` | Cocheras | `number` | |
| `age` | Antigüedad (años) | `number` | |
| `condition` | Estado | `string` list | ver §6 |
| `maintenanceFee` | Expensas | `price` (object) | opcional |
| `amenities` | Amenities | `array<string>` list | ver §6 |
| `mainImage` | Imagen principal | `image` | `hotspot` + `alt` requerido |
| `gallery` | Galería | `array<image>` | cada una con `alt` |
| `status` | Estado de publicación | `string` list | ver §6 |
| `featured` | Destacada | `boolean` | pin editorial para home |
| `instagramUrl` | Instagram | `url` | opcional; link liviano "Ver en Instagram" (prueba social, no embed) |

---

## 3. `zone` — taxonomía (para filtros)

| name | Title | Tipo | Notas |
|---|---|---|---|
| `name` | Nombre | `string` | required (ej. "Palermo") |
| `slug` | Slug | `slug` | source `name`; para URLs de filtro |
| `city` | Localidad | `string` | ej. "CABA" |
| `province` | Provincia | `string` | ej. "Buenos Aires" |

`property.location.zone` la **referencia** → filtros server-side limpios y reutilizables.

---

## 4. `agency` — singleton de configuración

Documento **único** (Studio sin "crear nuevo"). Destino de todas las consultas (leads).

| name | Title | Tipo |
|---|---|---|
| `name` | Nombre | `string` |
| `logo` | Logo | `image` |
| `phone` | Teléfono | `string` |
| `whatsapp` | WhatsApp | `string` |
| `email` | Email | `string` (validación email) |
| `address` | Dirección | `string` |
| `socials` | Redes | `object` (instagram, facebook, …) |

---

## 4-bis. `lead` — consulta (registro durable)

Cada consulta del form se **persiste como document** antes de notificar por email (Resend). Email = notificación; este document = la verdad. Flujo en [`ARCHITECTURE.md §3`](ARCHITECTURE.md). El editor las ve en el Studio; nunca se pierde un lead aunque falle el mail.

| name | Title | Tipo | Notas |
|---|---|---|---|
| `name` | Nombre | `string` | required |
| `phone` | Teléfono | `string` | required-ish (phone o email) |
| `email` | Email | `string` | validación email; opcional si hay phone |
| `message` | Mensaje | `text` | opcional |
| `property` | Propiedad | `reference`→`property` | opcional (consulta general vs por propiedad) |
| `source` | Origen | `string` list | `form` · `whatsapp` (de dónde vino) |
| `status` | Estado | `string` list | `new`→Nueva · `contacted`→Contactada · `closed`→Cerrada (gestión del editor) |

- `_createdAt` (nativo) = fecha de la consulta; no se modela aparte.
- Sin auth/cuentas (Non-Goal): el `lead` es solo registro interno, no entidad de usuario.

---

## 5. Objetos (no-document)

- **`operation`** — `type` (`string` list: sale/rent/temporaryRent) + `price` (`price`).
  - **Regla de moneda**: si `type === 'sale'` → `price.currency` con `initialValue: 'USD'` pero **editable** (no readOnly). El mercado AR de venta es abrumadoramente USD (de ahí el default), pero la venta **en pozo / fideicomiso** suele pactarse en ARS indexado (CAC/UVA) — y el schema ya admite `condition: preConstruction`; lockear USD se contradiría con ese enum. Si `rent`/`temporaryRent` → `currency` seleccionable USD | ARS.
- **`price`** — `amount` (`number`, required, ≥0) + `currency` (`string` list: USD/ARS). **Sin conversión dinámica** (Non-Goal).
- **`location`** — `zone` (`reference`→`zone`) + `address` (`string`, opcional) + `showAddress` (`boolean`, privacidad) + `geopoint` (`geopoint`, Mapbox).
- **`maintenanceFee`** — reutiliza `price` (amount + currency).

---

## 6. Enums / listas

`{ title (español) : value (inglés) }`.

| Lista | value: title |
|---|---|
| `propertyType` | house: Casa · apartment: Departamento · ph: PH · land: Terreno · commercial: Local · office: Oficina · warehouse: Galpón · garage: Cochera · farm: Campo |
| `operation.type` | sale: Venta · rent: Alquiler · temporaryRent: Alquiler temporario |
| `currency` | USD · ARS |
| `condition` | brandNew: A estrenar · used: Usado · preConstruction: En pozo |
| `property.status` | available: Disponible · reserved: Reservada · sold: Vendida · rented: Alquilada |
| `amenities` | pool: Pileta · grill: Parrilla · communityRoom: SUM · gym: Gimnasio · security24h: Seguridad 24h · laundry: Laundry · solarium: Solárium · visitorParking: Cochera de visitas |
| `lead.source` | form: Formulario · whatsapp: WhatsApp |
| `lead.status` | new: Nueva · contacted: Contactada · closed: Cerrada |

---

## 7. JSON de ejemplo (property completa)

Venta en USD + alquiler en ARS, simultáneos. Los `name`/valores de enum en inglés; el **contenido** (textos) en español:

```json
{
  "_type": "property",
  "_id": "property-palermo-soler-3400",
  "title": "Departamento 3 ambientes con balcón en Palermo",
  "slug": { "_type": "slug", "current": "departamento-3-ambientes-balcon-palermo" },
  "code": "PROP-0142",
  "propertyType": "apartment",
  "operations": [
    { "_key": "op-sale", "_type": "operation", "type": "sale",
      "price": { "_type": "price", "amount": 185000, "currency": "USD" } },
    { "_key": "op-rent", "_type": "operation", "type": "rent",
      "price": { "_type": "price", "amount": 650000, "currency": "ARS" } }
  ],
  "description": [
    { "_type": "block", "_key": "b1", "style": "normal", "markDefs": [],
      "children": [ { "_type": "span", "_key": "s1", "text": "Luminoso 3 ambientes al frente con balcón corrido, cocina integrada y excelente ubicación a metros del subte.", "marks": [] } ] }
  ],
  "location": {
    "_type": "location",
    "zone": { "_type": "reference", "_ref": "zone-palermo" },
    "address": "Soler 3400",
    "showAddress": false,
    "geopoint": { "_type": "geopoint", "lat": -34.5889, "lng": -58.4253 }
  },
  "bedrooms": 2,
  "bathrooms": 1,
  "rooms": 3,
  "coveredArea": 65,
  "totalArea": 72,
  "parkingSpaces": 1,
  "age": 12,
  "condition": "used",
  "maintenanceFee": { "_type": "price", "amount": 95000, "currency": "ARS" },
  "amenities": ["grill", "communityRoom", "security24h", "laundry"],
  "mainImage": {
    "_type": "image",
    "asset": { "_type": "reference", "_ref": "image-abc123-2000x1333-jpg" },
    "hotspot": { "x": 0.5, "y": 0.4, "height": 0.8, "width": 0.9 },
    "crop": { "top": 0, "bottom": 0, "left": 0, "right": 0 },
    "alt": "Living comedor con balcón al frente"
  },
  "gallery": [
    { "_type": "image", "_key": "g1", "asset": { "_type": "reference", "_ref": "image-def456-2000x1333-jpg" }, "alt": "Cocina integrada" },
    { "_type": "image", "_key": "g2", "asset": { "_type": "reference", "_ref": "image-ghi789-2000x1333-jpg" }, "alt": "Dormitorio principal" }
  ],
  "status": "available",
  "featured": true,
  "instagramUrl": "https://www.instagram.com/p/Cxyz123/"
}
```

Notas del shape: arrays (`operations`, `gallery`) llevan `_key`; `zone` es `reference` (`_ref`); `description` es Portable Text; imágenes con `asset` reference + `hotspot`/`crop` + `alt`.

---

## 8. Imágenes

El schema define `hotspot: true` + `alt`. El **patrón de render anti-deformación** (contenedor `aspect-ratio` + `<Image fill>` + `object-cover`, LQIP, `sizes`/`priority`) ya vive en [`DESIGN.md §9`](DESIGN.md) — no se repite acá. La query GROQ debe incluir `asset->{ metadata { lqip, dimensions } }` para el blur-up.
