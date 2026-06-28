import type { Metadata } from "next"
import { LeadForm } from "@/features/leads"
import { SITE, whatsappUrl } from "@/shared/config/site"
import { Button } from "@/shared/ui/button"
import { WhatsAppIcon } from "@/shared/ui/icons"

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Dejanos tu consulta y te contactamos a la brevedad. Teléfono, email y WhatsApp de Hausly.",
  alternates: { canonical: "/contacto" },
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  SITE.contact.address,
)}`

// Página de contacto (specs/LAYOUT.md §8): form de lead + NAP de la agencia +
// WhatsApp + link al mapa. Estática: el form es un client component (`LeadForm`)
// que llama al Server Action; la página sólo compone.
export default function ContactPage() {
  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-10 lg:py-14">
      <header className="max-w-prose">
        <h1 className="text-heading text-foreground">Contacto</h1>
        <p className="mt-2 text-body text-muted-foreground">
          ¿Buscás una propiedad o querés vender? Dejanos tu consulta y te respondemos a la brevedad.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div className="max-w-xl">
          <LeadForm />
        </div>

        <aside className="space-y-6 lg:border-l lg:pl-8">
          <div>
            <h2 className="text-subheading font-semibold text-foreground">{SITE.name}</h2>
            <address className="mt-3 space-y-1.5 text-body-sm text-muted-foreground not-italic">
              <p>{SITE.contact.address}</p>
              <p>
                <a href={SITE.contact.phoneHref} className="hover:text-foreground hover:underline">
                  {SITE.contact.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="hover:text-foreground hover:underline"
                >
                  {SITE.contact.email}
                </a>
              </p>
            </address>
          </div>

          <Button asChild variant="outline" size="lg" className="h-11 w-full">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
          </Button>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-body-sm text-link underline-offset-4 hover:underline"
          >
            Ver la oficina en Google Maps
          </a>
        </aside>
      </div>
    </section>
  )
}
