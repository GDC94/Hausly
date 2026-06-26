# Analytics — Estrategia de medición (PostHog)

Fuente de verdad de **qué medimos y cómo**. Define el funnel, la taxonomía de eventos y la integración
de PostHog. El **stack** (PostHog en el tooling) se decide en [`STACK.md`](STACK.md); el **chrome** del
banner de consentimiento en [`LAYOUT.md`](LAYOUT.md); a11y/CWV en [`SEO.md`](SEO.md) — acá se
referencian, no se redefinen.

> ↑ **Volver:** [`PRD.md`](PRD.md) (producto · entrada) · [`CLAUDE.md`](CLAUDE.md) (índice).

---

## 1. Principio

Medir el **funnel de la inmobiliaria**, no vanity metrics:

```
descubrir → filtrar → ver detalle → consultar (lead)
```

Reglas:
- **Intencional**: un puñado de eventos con sentido de negocio, no autocapture de todo.
- **El lead es el evento-plata** — se mide del lado servidor para que ningún adblocker lo tire.
- **No amenaza CWV** (el gate `lhci` de [`SEO.md §9`](SEO.md) es sagrado): carga diferida, reverse
  proxy, **sin session replay** por ahora.
- **Cero PII en eventos**: nombre/email/teléfono viven en Sanity (registro durable); PostHog solo
  lleva ids, refs y buckets. Sanity = PII; PostHog = conducta.

---

## 2. Stack

| Pieza | Qué |
|-------|-----|
| **`posthog-js`** | Cliente. Init en `instrumentation-client.ts`. Pageviews + eventos de cliente. |
| **`posthog-node`** | Servidor. El evento de lead desde el Server Action. |
| **Cloud** | **US** (`us.i.posthog.com`) — menor latencia desde AR que EU. (EU solo si apareciera un requisito de residencia de datos.) |
| **Reverse proxy** | Next rewrites por el dominio propio → menos bloqueo de adblockers, mejor data. |
| **Env** | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (cliente, `NEXT_PUBLIC_`). |

---

## 3. Arquitectura — `shared/analytics/`

Analytics es **cross-cutting** → vive en `shared/` ([`ARCHITECTURE.md §2`](ARCHITECTURE.md)), no en un
feature.

- **Wrapper `capture()` tipado** + **enum de nombres de evento en UN solo lugar**. Los nombres de
  evento son un **contrato tipado** (igual que el Zod-at-edges): no se tipea un string suelto en cada
  componente. **Un concepto = una fuente.**
- **El consentimiento se chequea DENTRO de `capture()`**: es **no-op hasta el opt-in** (§6). Ningún
  call site espolvorea checks de consent — la complejidad queda escondida tras la interfaz. Los
  componentes llaman `capture(...)` y listo.
- **Pageviews manuales**: App Router **NO** captura navegaciones solo. Un client component con
  `usePathname`/`useSearchParams` dispara `$pageview` en cada cambio de ruta.

```ts
// shared/analytics/events.ts — los nombres viven acá, en un solo lugar
export const ANALYTICS_EVENTS = {
  searchFromHome: 'search_from_home',
  filterApplied: 'filter_applied',
  loadMoreClicked: 'load_more_clicked',
  propertyViewed: 'property_viewed',
  whatsappClicked: 'whatsapp_clicked',
  leadSubmitted: 'lead_submitted',
} as const;
```

---

## 4. Taxonomía de eventos

Mínima e intencional (~6 + pageview). **snake_case**, sin PII.

| Evento | Cuándo | Props | Lado |
|--------|--------|-------|------|
| `$pageview` | cada navegación | `path` | cliente |
| `search_from_home` | submit de la búsqueda del hero | `operation`, `zone` | cliente |
| `filter_applied` | se aplica un filtro en `/propiedades` | filtros activos | cliente |
| `load_more_clicked` | botón "Cargar más" | `offset` | cliente |
| `property_viewed` | página de detalle | `propertyId`, `zone`, `operation`, `priceBucket` | cliente |
| `whatsapp_clicked` | CTA de WhatsApp (soft conversion) | `source` | cliente |
| `lead_submitted` | **Server Action, tras persistir** | `propertyId`, `source` | **servidor** |

> Valores como `operation`/`zone` salen del lenguaje ubicuo ([`DOMAIN.md`](DOMAIN.md)); `priceBucket`
> es un rango (ej. `100k-200k`), nunca el precio exacto cruzado con otros datos.

---

## 5. El lead server-side + funnel

`lead_submitted` se captura **server-side en el Server Action**, **después** de persistir el `lead` en
Sanity ([`ARCHITECTURE.md §3`](ARCHITECTURE.md)). Por qué:
- Es el evento más importante (la consulta = posible venta). Server-side, **ningún adblocker lo tira**.
- Refuerza la separación: Sanity guarda la PII del lead (durable); PostHog registra que **ocurrió** una
  conversión (conducta), con refs, no datos personales.

```ts
// en el Server Action, DESPUÉS de guardar el lead en Sanity
const ph = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  flushAt: 1, flushInterval: 0,        // funciones cortas: flush inmediato
});
ph.capture({ distinctId, event: 'lead_submitted', properties: { propertyId, source } });
await ph.shutdown();                    // siempre: flushea antes de responder
```

**Funnel completo** (lo habilita la decisión cookies + consentimiento): el cliente propaga su
`distinct_id` al Server Action junto al payload del form; el server captura con ese `distinctId` → el
`lead_submitted` se **linkea al recorrido previo** del visitante (pageviews, filtros, detalle vistos).

---

## 6. Consentimiento (cookies + banner)

- PostHog arranca **opt-out por default**; al **aceptar** el banner → `opt_in_capturing()`.
  Persistencia cookie/localStorage → habilita el funnel cross-session.
- **`capture()` es el único gate**: mientras no haya opt-in, es **no-op** (no captura nada). Así el
  consentimiento se respeta en UN solo lugar (§3), no en cada call site.
- **El banner es chrome global** (shell `(site)`, [`LAYOUT.md §2`](LAYOUT.md)). Requisitos **duros**
  del proyecto:
  - **100% accesible**: focuseable, navegable por teclado, contraste AA, foco visible
    ([`SEO.md`](SEO.md)).
  - **Sin CLS**: reservar espacio / usar overlay; **no** romper Core Web Vitals (gate `lhci`).
- Rechazar o ignorar = PostHog queda en opt-out (no captura). El estado de consentimiento persiste.

---

## 7. CWV + privacidad

- **Carga diferida** (`instrumentation-client`), **reverse proxy**, **sin session replay** (pesado para
  CWV y privacidad — se evalúa más adelante si el uso lo justifica).
- **Cero PII en props**: jamás nombre/email/teléfono en un evento. Solo ids, refs de dominio y buckets.
- Banner sin layout shift. Todo bajo el gate de a11y/CWV de [`SEO.md §9`](SEO.md).

---

## 8. El MCP de PostHog

El **MCP de PostHog** es la herramienta **operativa post-launch**, no de esta fase de definición:
- Consultar eventos, armar **insights** y el **funnel** descubrir→lead, manejar **feature flags**.
- Requiere un proyecto con datos → se **autentica al implementar** (OAuth), no ahora.

> Esta fase define la estrategia (qué medir, cómo integrar) con la doc de best-practices. El MCP entra
> cuando haya datos que mirar.
