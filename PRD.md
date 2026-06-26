# PRD — Sitio web inmobiliaria

Documento de **producto**: el **QUÉ** y el **POR QUÉ**. El **CÓMO** vive en los specs técnicos
(§7) — acá se linkea, no se repite. Fuente única del alcance, los usuarios y la barra de "terminado".

> Este PRD destila lo que ya está escrito en los specs y en `CLAUDE.md`. La parte nueva son las
> **preguntas abiertas** (§8), que se cierran antes de partir en issues.

---

## 1. Resumen

Sitio web público para una inmobiliaria argentina: **catálogo de propiedades** en venta y alquiler,
**buscable y filtrable**, con **captación de consultas** (leads), optimizado para **SEO local**, y
cargado por gente **no técnica** vía Sanity Studio.

---

## 2. Problema / Por qué existe

- La inmobiliaria necesita **presencia web propia**, no depender solo de portales (Zonaprop /
  Argenprop).
- Captar **consultas directas** sin comisión de portal.
- Aparecer en **búsqueda local** ("departamentos en Palermo") y ser **citada por motores de IA**.

---

## 3. Usuarios

| Usuario | Quién es | Qué necesita |
|---|---|---|
| **Visitante / interesado** | Alguien buscando propiedad | Buscar, filtrar, ver detalle, consultar |
| **Editor (dueño/inmobiliaria)** | Persona **no técnica** | Cargar y gestionar propiedades, zonas y consultas desde el Studio, sin tocar código |

Sin cuentas de usuario para el visitante (ver §5).

---

## 4. Requisitos funcionales

Expresados en **capacidades de usuario** (rebanadas verticales), no en archivos. Cada bullet es
candidato a una issue independiente. Detalle técnico → §7.

### El visitante puede
- Ver el **listado** de propiedades disponibles.
- **Filtrar**: operación → moneda → precio (contextual), zona, tipo, ambientes, baños, superficie,
  cocheras, estado, amenities, texto libre. Catálogo completo → [`FILTERS.md`](FILTERS.md).
- Navegar **landings por zona** indexables (`/propiedades/zona/[zona]`).
- Ver el **detalle** de una propiedad: galería, **precio dual USD/ARS**, ubicación en **mapa
  estático**, características, amenities, descripción.
- Enviar una **consulta** (form) y/o **contactar por WhatsApp**.

### El editor puede
- Cargar / editar / publicar una **`property`** (100% en español en el Studio).
- Gestionar **`zone`** (taxonomía de barrios/localidades).
- Configurar la **`agency`** (singleton: NAP, redes, logo).
- Ver y gestionar **`leads`** (estado: nueva → contactada → cerrada).

Entidades y campos → [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md).

### El sistema
- **Persiste el `lead` antes de notificar** — una consulta nunca se pierde aunque falle el email.
- **Revalida on-demand** al publicar en Sanity (webhook), sin esperar TTL.
- **Cachea** las queries de listado por tags (invalidación por contenido).
- Genera **metadata + JSON-LD + sitemap + robots** derivados del contenido.

---

## 5. Fuera de scope (Non-Goals)

Fuente: [`CLAUDE.md`](CLAUDE.md). El "no" es tan importante como el "sí".

- ❌ Auth / cuentas de usuario / login.
- ❌ Favoritos / comparador.
- ❌ Multi-idioma.
- ❌ **Conversión dinámica USD ↔ ARS** (los precios se muestran en su moneda original).
- ❌ **Mapa interactivo** en el MVP (mapa estático; interactivo diferido).
- ❌ GSAP en el stack base (CSS + View Transitions; GSAP solo si una pantalla lo justifica).

---

## 6. Definition of Done (la barra)

Cómo sabemos que está terminado. Barras **duras, no aspiracionales**.

- ✅ **100% Lighthouse Accessibility** + **100% navegable por teclado**.
- ✅ **Core Web Vitals verdes en campo** (CrUX / GSC — no solo el número lab).
- ✅ Filtros **server-side**, con la **URL como única fuente de verdad** del estado de búsqueda.
- ✅ **Un lead nunca se pierde**: persistido en Sanity aunque falle la notificación.
- ✅ SEO: **JSON-LD válido** (Rich Results Test) + sitemap + **zonas indexables** + canonical por
  página.
- ✅ **Lighthouse CI gate** bloquea el merge si a11y < 100.

Detalle y medición (lab vs campo) → [`SEO.md §6, §9`](SEO.md). Estrategia de testing completa
(pirámide determinista + `agent-browser`) → [`TESTING.md`](TESTING.md).

---

## 7. Restricciones técnicas — punteros (no se repite acá)

| Tema | Fuente |
|---|---|
| Stack + tooling | [`STACK.md`](STACK.md) |
| Arquitectura, data flow, rendering | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Lenguaje ubicuo (ES↔EN) | [`DOMAIN.md`](DOMAIN.md) |
| Modelo de dominio / schemas | [`SANITY-SCHEMA.md`](SANITY-SCHEMA.md) |
| Catálogo de filtros | [`FILTERS.md`](FILTERS.md) |
| Design tokens | [`DESIGN.md`](DESIGN.md) |
| SEO / GEO / a11y | [`SEO.md`](SEO.md) |
| Testing + deploy (Vercel) | [`TESTING.md`](TESTING.md) |

Decisión de mercado (AR → precios USD + ARS) y decisiones clave → [`CLAUDE.md`](CLAUDE.md).

---

## 8. Decisiones cerradas

Las 4 dudas de scope quedaron resueltas (grilling). Sin preguntas abiertas → listo para `/to-issues`.

- [x] **UX del filtro contextual** (operación → moneda → precio): **revelado inline** — el bloque de
      precio se expande en su lugar con transición `motion-safe`, empujando suave lo de abajo. **Sin
      prototipo** (la lógica ya está cerrada en `FILTERS.md`). Detalle → [`FILTERS.md §5`](FILTERS.md).
- [x] **Listado**: botón **"Cargar más"** sobre **URLs crawleables** (no infinite scroll — rompía
      SEO, a11y, CWV y el botón atrás). Auto-load opcional como enhancement. Detalle →
      [`FILTERS.md §5`](FILTERS.md).
- [x] **Display de referencia ARS**: **descartado.** Cada precio en su moneda original (USD/ARS), sin
      conversión ni cotización externa (refuerza el Non-Goal §5).
- [x] **Volumen inicial**: **<20 propiedades**, carga manual → `generateStaticParams` **pre-genera
      todas** en el build (sin ISR on-demand inicial). Detalle → [`ARCHITECTURE.md §4`](ARCHITECTURE.md).
