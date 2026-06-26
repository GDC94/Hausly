# Design tokens — Sitio inmobiliaria

Fuente de verdad de los **design tokens**. Estos valores se vuelcan a `globals.css` (`:root` + `@theme inline` + `@utility`) y a las CSS vars de shadcn/ui. Decisiones de stack en [`STACK.md`](STACK.md); estructura/componentes en [`ARCHITECTURE.md`](ARCHITECTURE.md).

Reglas: **light-only** por ahora (`.dark` declarado, diferido). Tokens en OKLCH/hex; los nombres semánticos coinciden con la convención de shadcn. Acá viven **solo tokens** — nada de atomic design ni inventario de componentes. La **composición visual / anatomía de páginas** (qué secciones, en qué orden) vive en [`LAYOUT.md`](LAYOUT.md).

---

## 1. Color

Paleta moderno-minimalista, light. Valores hex exactos de la marca. El único no provisto es `--destructive` (rojo) → **propuesto**, a confirmar.

```css
:root {
  /* Superficies y texto */
  --background: #ffffff;
  --foreground: #151819;
  --card: #ffffff;
  --card-foreground: #151819;
  --popover: #ffffff;
  --popover-foreground: #151819;

  /* Acciones */
  --primary: #151819;            /* casi-negro, alto énfasis */
  --primary-foreground: #ffffff;
  --secondary: #f0f2f3;
  --secondary-foreground: #1d2123;
  --accent: #2bb1ff;             /* azul, CTAs/links/interacción */
  --accent-foreground: #ffffff;

  /* Sutiles */
  --muted: #f0f2f3;
  --muted-foreground: #4e5257;  /* slate — AA-safe: 7.87:1 sobre blanco (texto chico OK). Resolución contraste → SEO.md §6 */

  /* Estado */
  --destructive: #e5484d;        /* PROPUESTO — no estaba en la paleta */
  --destructive-foreground: #ffffff;

  /* Bordes y foco */
  --border: #f0f2f3;
  --input: #f0f2f3;
  --ring: #2bb1ff;
}

/* Diferido — completar cuando se sume dark mode (mismos nombres, valores oscuros). */
.dark {
  /* TODO: invertir superficies (background oscuro, foreground claro), recalcular
     muted/border, mantener accent #2bb1ff. No reestructura: solo valores. */
}
```

Colores nombrados extra (para usar directo cuando no hay token semántico):

| Var | Hex | Uso |
|-----|-----|-----|
| `--color-success` | `#45aa3e` | estados ok |
| `--color-link` | `#0000ee` | links de texto |
| `--color-ink` | `#151819` | rampa neutra |
| `--color-graphite` | `#1d2123` | rampa neutra |
| `--color-slate` | `#4e5257` | rampa neutra |
| `--color-gray` | `#8d9499` | rampa neutra — ⚠ 3.08:1: solo UI/bordes/texto grande, NUNCA texto chico (a11y → SEO.md §6) |
| `--color-mist` | `#f0f2f3` | rampa neutra |
| `--color-black` | `#000000` | absoluto |

---

## 2. Tipografía

Fuente **Geist Sans** vía `next/font` (variable `--font-geist-sans`). Patrón: **clases semánticas** que empaquetan familia + peso + tamaño + line-height + tracking. En componentes se usa `text-heading`, nunca `font-[600] text-2xl leading-[1.1]`.

Tokens de escala (con companions de line-height y tracking):

```css
@theme inline {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;

  /* Títulos: fluidos con clamp(min, rem + vw, max). El término en `rem` preserva
     el zoom del usuario (WCAG 1.4.4); el vw da el escalado continuo; min/max lo acotan. */
  --text-display: clamp(2.5rem, 1.7rem + 4vw, 4rem);        --text-display--line-height: 1;    --text-display--letter-spacing: -0.03em;
  --text-heading: clamp(1.75rem, 1.3rem + 2.25vw, 2.5rem);  --text-heading--line-height: 1.1;  --text-heading--letter-spacing: -0.02em;
  --text-subheading: clamp(1.25rem, 1.05rem + 1vw, 1.5rem); --text-subheading--line-height: 1.2; --text-subheading--letter-spacing: -0.01em;
  /* Lectura: FIJO (~16px). Escalar body por viewport es anti-patrón de legibilidad. */
  --text-body: 1rem;            --text-body--line-height: 1.5;     --text-body--letter-spacing: 0em;
  --text-body-sm: 0.875rem;     --text-body-sm--line-height: 1.5;  --text-body-sm--letter-spacing: 0em;
  --text-caption: 0.8125rem;    --text-caption--line-height: 1.3;  --text-caption--letter-spacing: 0em;
}
```

Utilities semánticas (los títulos escalan fluido con `clamp()` desde el token; el body queda fijo):

```css
@utility text-display {
  font-family: var(--font-sans); font-weight: 600;
  font-size: var(--text-display); line-height: var(--text-display--line-height);
  letter-spacing: var(--text-display--letter-spacing); text-wrap: balance;
}
@utility text-heading {
  font-family: var(--font-sans); font-weight: 600;
  font-size: var(--text-heading); line-height: var(--text-heading--line-height);
  letter-spacing: var(--text-heading--letter-spacing); text-wrap: balance;
}
@utility text-subheading {
  font-family: var(--font-sans); font-weight: 500;
  font-size: var(--text-subheading); line-height: var(--text-subheading--line-height);
  letter-spacing: var(--text-subheading--letter-spacing);
}
@utility text-body {
  font-family: var(--font-sans); font-weight: 400;
  font-size: var(--text-body); line-height: var(--text-body--line-height);
}
@utility text-body-sm {
  font-family: var(--font-sans); font-weight: 400;
  font-size: var(--text-body-sm); line-height: var(--text-body-sm--line-height);
}
@utility text-caption {
  font-family: var(--font-sans); font-weight: 500;
  font-size: var(--text-caption); line-height: var(--text-caption--line-height);
}
```

---

## 3. Radius

```css
@theme inline {
  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 16px);
  --radius-full: 9999px;
}
```

---

## 4. Shadows

Escala discreta acorde al look minimalista (ink a baja opacidad).

```css
@theme inline {
  --shadow-xs: 0 1px 2px 0 rgb(21 24 25 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(21 24 25 / 0.08), 0 1px 2px -1px rgb(21 24 25 / 0.08);
  --shadow-md: 0 4px 8px -2px rgb(21 24 25 / 0.10), 0 2px 4px -2px rgb(21 24 25 / 0.06);
  --shadow-lg: 0 12px 16px -4px rgb(21 24 25 / 0.10), 0 4px 6px -4px rgb(21 24 25 / 0.05);
  --shadow-xl: 0 20px 24px -4px rgb(21 24 25 / 0.10);
  --shadow-2xl: 0 24px 48px -12px rgb(21 24 25 / 0.18);
  --shadow-inner: inset 0 2px 4px 0 rgb(21 24 25 / 0.06);
}
```

---

## 5. Spacing & z-index

```css
@theme inline {
  --spacing: 0.25rem;        /* base; Tailwind deriva la escala (p-2, gap-4, …) */

  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-toast: 1400;
}
```

---

## 6. Breakpoints

Declarados explícitos (aunque Tailwind los traiga por default).

```css
@theme inline {
  --breakpoint-sm: 40rem;   /* 640px */
  --breakpoint-md: 48rem;   /* 768px */
  --breakpoint-lg: 64rem;   /* 1024px */
  --breakpoint-xl: 80rem;   /* 1280px */
  --breakpoint-2xl: 96rem;  /* 1536px */
}
```

---

## 7. Container

```css
@theme inline {
  --container-max: 80rem;        /* 1280px — ancho máximo del contenido */
  --container-padding: 1rem;     /* padding lateral mobile (sube en md+) */
}
```

---

## 8. Motion

Default: **CSS transitions / `@keyframes` + View Transitions API** (nativo, 0 KB). **GSAP diferido** —
solo si una pantalla justifica una timeline real (hero coreografiado, scroll-scrubbing); ahí entra
lazy + por-ruta, nunca en el bundle base (ver [`STACK.md §1`](STACK.md)). SIEMPRE bajo `motion-safe` /
`prefers-reduced-motion`. Estos tokens (durations + eases) los consumen **tanto las transiciones CSS
como un GSAP futuro**.

```css
@theme inline {
  --duration-fast: 150ms;
  --duration: 250ms;
  --duration-slow: 400ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);   /* curva firma */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

---

## 9. Imágenes

La imagen es el producto: **NUNCA se deforma.** Verificado contra la doc oficial de `next/image` (Next.js v16).

Aspect-ratio tokens:

```css
@theme inline {
  --aspect-card: 4 / 3;      /* card de propiedad */
  --aspect-hero: 16 / 9;     /* hero / detalle */
  --aspect-thumb: 1 / 1;     /* miniatura */
}
```

**Regla de oro (anti-deformación):** contenedor con `aspect-ratio` fijo (token) + `<Image fill>` + **`object-cover`**. La foto llena y recorta parejo; jamás se estira. El contenedor manda la forma, la imagen mantiene su proporción.

```tsx
// Patrón canónico — el contenedor define la forma, object-cover evita deformar.
<div className="relative aspect-card overflow-hidden rounded-lg">
  <Image
    src={url}
    alt={titulo}
    fill
    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
    className="object-cover"
    placeholder="blur"
    blurDataURL={lqip}
    // priority  ← solo en above-the-fold (hero, primeras cards)
  />
</div>
```

Reglas del estándar:
- **Prohibido** `width`/`height` fijos metiendo la foto en una caja de otra proporción → estira.
- `sizes` **siempre** con `fill` (sirve el tamaño justo por viewport, no baja una imagen gigante).
- `priority` en above-the-fold (hero, primeras cards) → LCP.
- `placeholder="blur"` + `blurDataURL` (LQIP de Sanity) → sin layout shift, blur-up al cargar.
- `alt` siempre (a11y + SEO).
- Remotas: `next.config` → `images.remotePatterns` con host `cdn.sanity.io`. AVIF/WebP automáticos.
- Sanity es hotspot/crop-aware vía el image-url builder; se respeta el recorte del CMS. Schema de imagen → `SANITY-SCHEMA.md`.

> El componente wrapper que aplica este patrón (`PropertyImage`) es implementación (`shared/ui` / `features/properties`), no vive acá.

---

## 10. `globals.css` (ejemplo de ensamblado)

```css
@import "tailwindcss";

:root {
  /* …vars de color de la sección 1… */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  /* …font/text, radius, shadows, spacing/z, breakpoints, container, motion, aspect (secciones 2–9)… */
}

/* …@utility de tipografía (sección 2)… */

@layer base {
  :focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
  body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
}
```

> `DESIGN.md` define **valores + por qué**; `globals.css` es el reflejo mecánico. Si un token cambia, se cambia acá.
