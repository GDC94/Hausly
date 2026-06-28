import type { Metadata } from "next"
import Link from "next/link"
import { getFeaturedProperties, PropertyGrid } from "@/features/properties"
import { getZones, HomeSearch } from "@/features/search"
import { SITE, whatsappUrl } from "@/shared/config/site"
import { Button } from "@/shared/ui/button"
import { WhatsAppIcon } from "@/shared/ui/icons"

// Home = portada / brand-first. `title.absolute` evita el template " | Hausly"
// (sería "Hausly | Hausly"); canonical "/" fija la raíz como URL indexable
// (specs/SEO.md §2). El resto de la metadata base (metadataBase, OG) la hereda
// del layout raíz.
export const metadata: Metadata = {
  title: { absolute: "Hausly — Propiedades en venta y alquiler en Argentina" },
  description:
    "Casas, departamentos y más en venta y alquiler en las mejores zonas. Encontrá tu próxima propiedad con Hausly.",
  alternates: { canonical: "/" },
}

// Portada híbrida (specs/LAYOUT.md §3): hero + búsqueda compacta → destacadas →
// "por qué nosotros" (bento de agencia) → CTA contacto. RSC: sólo compone y
// fetchea; cero estado de cliente. Cacheada por tags (`['property','zone']`):
// publicar/destacar en Sanity revalida vía webhook (specs/ARCHITECTURE.md §4).
export default async function HomePage() {
  const [featured, zones] = await Promise.all([getFeaturedProperties(), getZones()])

  return (
    <>
      <HeroSection zones={zones} />
      <FeaturedSection featured={featured} />
      <WhyUsSection zonesCount={zones.length} />
      <ContactCta />
    </>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────
// Sin imagen de marca todavía (no hay asset): fondo tonal oscuro con glow accent
// (CSS puro, design tokens) sobre el que la card blanca de búsqueda resalta. El
// día que haya foto, se reemplaza el fondo por <Image fill> + overlay (§3).
function HeroSection({ zones }: { zones: Awaited<ReturnType<typeof getZones>> }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-background">
      {/* Glow accent decorativo — no aporta semántica. */}
      <div
        aria-hidden
        className="-z-10 absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(43,177,255,0.22),transparent_70%)]"
      />
      <div className="mx-auto max-w-(--container-max) px-(--container-padding) py-20 lg:py-28">
        <div className="max-w-2xl">
          <h1 className="text-display">Encontrá tu próxima propiedad</h1>
          <p className="mt-4 max-w-prose text-body text-background/80">
            Casas, departamentos y más en venta y alquiler en las mejores zonas. Empezá tu búsqueda
            acá.
          </p>
        </div>
        <div className="mt-8 max-w-2xl">
          <HomeSearch zones={zones} />
        </div>
      </div>
    </section>
  )
}

// ── Destacadas ────────────────────────────────────────────────────────────
// Pin editorial (`featured`) reusando `PropertyCard` sin variantes (§4). Si no
// hay ninguna destacada, no renderiza la sección (cero ruido en home).
function FeaturedSection({
  featured,
}: {
  featured: Awaited<ReturnType<typeof getFeaturedProperties>>
}) {
  if (featured.length === 0) return null

  return (
    <section className="mx-auto max-w-(--container-max) px-(--container-padding) py-16 lg:py-20">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-heading text-foreground">Propiedades destacadas</h2>
        <Link
          href="/propiedades"
          className="text-body-sm text-link underline-offset-4 hover:underline"
        >
          Ver todas las propiedades
        </Link>
      </header>
      <div className="mt-8">
        <PropertyGrid properties={featured} />
      </div>
    </section>
  )
}

// ── Por qué nosotros ──────────────────────────────────────────────────────
// Bento en clave AGENCIA (§3): stats + value props, sin foto ni persona. "Zonas"
// se deriva del dato real (zones.length); el resto son cifras de agencia
// (placeholder hasta cablear el singleton `agency`, ver shared/config/site).
function WhyUsSection({ zonesCount }: { zonesCount: number }) {
  const stats = [
    { value: "15", label: "años acompañando operaciones" },
    { value: "90+", label: "propiedades vendidas" },
    { value: zonesCount > 0 ? String(zonesCount) : "—", label: "zonas cubiertas" },
  ]

  const values = [
    {
      title: "Asesoramiento real",
      body: "Te guiamos en cada paso: tasación, visitas y cierre. Sin vueltas.",
    },
    {
      title: "Conocemos el barrio",
      body: "Operamos donde vivís: precios de mercado y oportunidades reales.",
    },
  ]

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-(--container-max) px-(--container-padding) py-16 lg:py-20">
        <h2 className="text-heading text-foreground">Por qué elegirnos</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-display text-foreground">{stat.value}</p>
              <p className="mt-1 text-body-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1 lg:first-of-type:col-span-2"
            >
              <h3 className="text-subheading font-semibold text-foreground">{value.title}</h3>
              <p className="mt-2 text-body-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA contacto ──────────────────────────────────────────────────────────
function ContactCta() {
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
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
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
