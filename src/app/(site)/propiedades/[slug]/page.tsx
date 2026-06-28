import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  buildBreadcrumbJsonLd,
  buildPropertyListingJsonLd,
  buildPropertyMetadata,
  buildSpecLine,
  getProperty,
  getPropertySlugs,
  PropertyAmenities,
  PropertyContactCard,
  PropertyDescription,
  PropertyFeatures,
  PropertyGallery,
  PropertyLocation,
  resolveGalleryImages,
} from "@/features/properties"
import { getSiteUrl } from "@/shared/config/site"
import { imageUrl } from "@/shared/sanity/image"
import { JsonLd } from "@/shared/ui/json-ld"

type Params = Promise<{ slug: string }>

// Detalle ISR: `generateStaticParams` pre-genera TODAS las propiedades en el build
// (volumen de lanzamiento <20, specs/ARCHITECTURE.md §4). La revalidación on-demand
// la dispara el webhook `/api/revalidate` al publicar en Sanity.
export async function generateStaticParams() {
  const slugs = await getPropertySlugs()
  return slugs.filter((s): s is { slug: string } => Boolean(s.slug))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const property = await getProperty(slug)
  return property ? buildPropertyMetadata(property) : {}
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const property = await getProperty(slug)
  if (!property) notFound()

  const siteUrl = getSiteUrl()
  const images = resolveGalleryImages(property)
  const listingLd = buildPropertyListingJsonLd(property, {
    siteUrl,
    imageUrl: (image) => imageUrl(image, { width: 1600 }),
  })
  const breadcrumbLd = buildBreadcrumbJsonLd(property, siteUrl)
  const specs = buildSpecLine(property)
  const zone = property.location?.zone

  return (
    <article className="mx-auto max-w-(--container-max) px-(--container-padding) py-6 lg:py-10">
      <JsonLd data={listingLd} />
      <JsonLd data={breadcrumbLd} />

      <nav aria-label="Migas de pan" className="mb-4 text-caption text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/propiedades" className="hover:text-foreground hover:underline">
              Propiedades
            </Link>
          </li>
          {zone?.name && zone.slug ? (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{zone.name}</li>
            </>
          ) : null}
        </ol>
      </nav>

      <PropertyGallery images={images} title={property.title ?? "Propiedad"} />

      <header className="mt-6">
        <h1 className="text-heading text-foreground">{property.title ?? "Propiedad"}</h1>
        <p className="mt-2 text-body-sm text-muted-foreground">
          {[zone?.name, specs, property.code ? `Cód. ${property.code}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <div className="space-y-10">
          <PropertyDescription property={property} />
          <PropertyFeatures property={property} />
          <PropertyAmenities property={property} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PropertyContactCard property={property} />
        </aside>
      </div>

      <div className="mt-12">
        <PropertyLocation property={property} />
      </div>
    </article>
  )
}
