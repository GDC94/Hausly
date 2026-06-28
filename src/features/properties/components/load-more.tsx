import Link from "next/link"
import { Button } from "@/shared/ui/button"

/**
 * Botón **"Cargar más"** del listado paginado (specs/FILTERS.md §4/§5). Es un
 * **Link crawleable** a la siguiente URL `?offset=N` — NO infinite scroll: el bot
 * lo sigue e indexa cada lote, el teclado lo enfoca y el footer queda siempre
 * alcanzable (los cuatro no-negociables: SEO, a11y, CWV, URL = fuente de verdad).
 *
 * `scroll={false}` preserva la posición de scroll: el nuevo lote se siente
 * "agregado abajo" en vez de saltar al tope. `rel="next"` encadena los lotes para
 * el crawler. `h-11` garantiza el tap target ≥44px (specs/SEO.md §6).
 */
export function LoadMore({ href }: { href: string }) {
  return (
    <div className="mt-12 flex justify-center">
      <Button asChild variant="outline" size="lg" className="h-11 px-8">
        <Link href={href} scroll={false} rel="next">
          Cargar más
        </Link>
      </Button>
    </div>
  )
}
