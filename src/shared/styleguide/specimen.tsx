import type { ReactNode } from "react"

type SpecimenProps = {
  /** Nombra qué se mira y contra qué compararlo: `Button · ghost · sm`, `PropertyCard · sin imagen`. */
  label: string
  /** `true` para componentes full-width/sticky (chrome) que necesitan su propio marco de contención. */
  framed?: boolean
  children: ReactNode
}

/**
 * Espécimen: wrapper presentacional con un encabezado liviano que nombra el componente
 * y la variante/estado (specs/STYLEGUIDE.md §6). Hace la vitrina un banco de revisión
 * —se sabe qué se mira— en vez de un volcado de renders. Es feature-agnóstico (sólo
 * tokens de DESIGN.md) → vive en `shared/`.
 *
 * `framed` crea un contenedor con su propio contexto de scroll (`overflow`): contiene
 * los `sticky` del chrome (SiteHeader) sin que se peguen a la página de la vitrina (§5).
 */
export function Specimen({ label, framed = false, children }: SpecimenProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-muted-foreground">{label}</p>
      <div
        className={
          framed
            ? "relative max-h-96 overflow-auto rounded-lg border border-border bg-background"
            : "rounded-lg border border-border bg-background p-4"
        }
      >
        {children}
      </div>
    </div>
  )
}
