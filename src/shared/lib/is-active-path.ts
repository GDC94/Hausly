/**
 * ¿El link `href` representa la sección activa para el `pathname` actual?
 *
 * - Home (`/`): solo coincidencia exacta.
 * - Secciones (`/propiedades`): activas también en sus rutas hijas
 *   (`/propiedades/zona/palermo`, `/propiedades/[slug]`), sin marcar
 *   secciones que apenas comparten prefijo de string (`/propiedades-destacadas`).
 *
 * Uso: resaltar el ítem de nav correspondiente a la ruta visitada.
 */
export function isActivePath(pathname: string, href: string): boolean {
  const current = normalize(pathname)
  const target = normalize(href)

  if (target === "/") return current === "/"
  return current === target || current.startsWith(`${target}/`)
}

/** Quita la barra final salvo en la raíz (`/propiedades/` ≡ `/propiedades`). */
function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path
}
