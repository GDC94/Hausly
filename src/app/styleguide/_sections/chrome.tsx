import { SiteFooter } from "@/shared/ui/site-footer"
import { SiteHeader } from "@/shared/ui/site-header"
import { Specimen } from "../_components/specimen"

/**
 * Sección `chrome` (specs/STYLEGUIDE.md §5): SiteHeader (sticky) y SiteFooter. El header
 * es `sticky top-0` → se exhibe en un marco con scroll propio (`framed`), que lo contiene
 * sin que se pegue a la página de la vitrina. HeaderNav se exhibe dentro del SiteHeader.
 */
export function ChromeSection() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">
          SiteHeader <span className="text-muted-foreground">(incluye HeaderNav)</span>
        </h3>
        <Specimen label="SiteHeader · sticky, en marco contenido" framed>
          {/* Alto extra para que el sticky tenga contra qué pegarse dentro del marco. */}
          <div className="h-[32rem]">
            <SiteHeader />
            <div className="px-4 py-6 text-body-sm text-muted-foreground">
              Scrolleá dentro del marco: el header queda pegado arriba.
            </div>
          </div>
        </Specimen>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">SiteFooter</h3>
        <Specimen label="SiteFooter · data estática" framed>
          <SiteFooter />
        </Specimen>
      </section>
    </div>
  )
}
