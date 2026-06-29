/**
 * Predicado de blindaje del laboratorio `/styleguide` (specs/STYLEGUIDE.md §2). La
 * vitrina es alcanzable en **dev local** y en el **preview del PR**, pero **invisible
 * en producción**. Aislar la decisión en una función pura permite verificar el gate por
 * unit test en cada push (§8) — el E2E corre contra preview (la ruta rinde 200), nunca
 * contra prod, así que el 404 sólo se prueba acá a nivel lógica.
 *
 * Se evalúa `VERCEL_ENV` (no `NODE_ENV`) porque distingue `production` / `preview` /
 * `development`, que es exactamente el eje del blindaje. Ausente (build local sin
 * Vercel) → no bloquea.
 */
export function isBlocked(vercelEnv: string | undefined): boolean {
  return vercelEnv === "production"
}
