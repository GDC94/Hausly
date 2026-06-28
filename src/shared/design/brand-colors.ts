/**
 * Paleta de marca como valores TS, para renderers que NO leen CSS: `next/og` /
 * satori (OG images) no resuelven las custom properties de `@theme`, así que
 * necesitan literales. Este módulo es la FUENTE ÚNICA de esos literales — espejo
 * de los tokens de `globals.css` (DESIGN.md §1).
 *
 * Es la excepción sancionada a la regla "design tokens only" de AGENTS.md: el
 * único contexto donde el color no puede salir de una clase Tailwind. El resto de
 * la UI sigue usando tokens. Si un token de marca cambia en `globals.css`, se
 * actualiza también acá.
 */
export const BRAND_COLORS = {
  /** `--foreground` / `--color-ink` */
  ink: "#151819",
  /** `--accent` / `--ring` */
  accent: "#2bb1ff",
  /** `--color-gray` — sólo UI / texto grande (contraste, SEO.md §6) */
  gray: "#8d9499",
  /** `--background` */
  surface: "#ffffff",
} as const
