import Link from "next/link"

import { SITE, whatsappUrl } from "@/shared/config/site"
import { FacebookIcon, InstagramIcon, StarIcon, WhatsAppIcon } from "@/shared/ui/icons"

/**
 * Chrome del sitio: footer full-bleed sobre la superficie `--primary`
 * (near-black, sin dark mode). Presentational/server. NAP desde la config
 * estática del sitio (placeholder hasta cablear el `agency` de Sanity).
 * Ver specs/LAYOUT.md §2.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-(--container-max) px-(--container-padding) py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Marca + redes */}
          <div>
            <p className="text-subheading font-semibold">{SITE.name}</p>
            <p className="mt-3 max-w-xs text-body-sm text-primary-foreground/70">
              Tu próxima propiedad, sin vueltas. Venta y alquiler en las mejores zonas.
            </p>
            <ul aria-label="Redes sociales" className="mt-5 flex items-center gap-2">
              <li>
                <SocialLink href={SITE.socials.instagram} label="Instagram">
                  <InstagramIcon className="size-5" />
                </SocialLink>
              </li>
              <li>
                <SocialLink href={SITE.socials.facebook} label="Facebook">
                  <FacebookIcon className="size-5" />
                </SocialLink>
              </li>
            </ul>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie">
            <h2 className="text-caption uppercase tracking-wide text-primary-foreground/60">
              Navegación
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {SITE.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto / NAP */}
          <div>
            <h2 className="text-caption uppercase tracking-wide text-primary-foreground/60">
              Contacto
            </h2>
            <address className="mt-4 flex flex-col gap-3 text-body-sm text-primary-foreground/80 not-italic">
              <span>{SITE.contact.address}</span>
              <a
                href={SITE.contact.phoneHref}
                className="transition-colors hover:text-primary-foreground"
              >
                {SITE.contact.phone}
              </a>
              <a
                href={`mailto:${SITE.contact.email}`}
                className="transition-colors hover:text-primary-foreground"
              >
                {SITE.contact.email}
              </a>
            </address>

            <div className="mt-5 flex flex-col gap-2">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-success px-4 py-2 text-body-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="size-5" />
                WhatsApp
              </a>
              <a
                href={SITE.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-body-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                <StarIcon className="size-4 text-accent" />
                Opiniones en Google
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-caption text-primary-foreground/60">
          © {year} {SITE.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-10 items-center justify-center rounded-md text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
    >
      {children}
    </a>
  )
}
