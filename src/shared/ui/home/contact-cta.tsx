import Link from "next/link"
import { SITE, whatsappUrl } from "@/shared/config/site"
import { Button } from "@/shared/ui/button"
import { WhatsAppIcon } from "@/shared/ui/icons"

/**
 * CTA de cierre de la home (specs/LAYOUT.md §3): bloque de contacto con link a
 * `/contacto` + WhatsApp. Presentación pura; el NAP sale de `shared/config/site`.
 */
export function ContactCta() {
  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-16 lg:py-20">
      <div className="rounded-3xl bg-ink px-6 py-12 text-center text-background lg:px-12 lg:py-16">
        <h2 className="text-heading">¿Listo para dar el próximo paso?</h2>
        <p className="mx-auto mt-3 max-w-prose text-body text-background/80">
          Contanos qué estás buscando y te ayudamos a encontrarlo. Respondemos a la brevedad.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="h-11">
            <Link href="/contacto">Contactar</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
          >
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" data-wa-source="home">
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
          </Button>
        </div>
        <p className="mt-6 text-caption text-background/60">{SITE.contact.address}</p>
      </div>
    </section>
  )
}
