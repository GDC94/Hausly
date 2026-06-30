import {
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
import { Specimen } from "@/shared/styleguide"
import { LeadFormIdle } from "../_components/lead-form-specimens"

/**
 * Sección `detail` (specs/STYLEGUIDE.md §5): los componentes del detalle sobre UNA
 * PropertyDetail real (`getPropertySlugs` → `getProperty`). La contact card lleva el
 * LeadForm (idle, vía LeadFormView) en su slot — sin disparar el Server Action.
 */
export async function DetailSection() {
  const slugs = await getPropertySlugs()
  const slug = slugs.find((entry) => entry.slug)?.slug
  const property = slug ? await getProperty(slug) : null

  if (!property) {
    return (
      <p className="text-body text-muted-foreground">
        No hay propiedades en staging para exhibir el detalle.
      </p>
    )
  }

  const images = resolveGalleryImages(property)
  const title = property.title ?? "Propiedad"

  return (
    <div className="flex flex-col gap-10">
      <Specimen label="PropertyGallery · data real">
        <PropertyGallery images={images} title={title} />
      </Specimen>
      <Specimen label="PropertyDescription · data real">
        <PropertyDescription property={property} />
      </Specimen>
      <Specimen label="PropertyFeatures · data real">
        <PropertyFeatures property={property} />
      </Specimen>
      <Specimen label="PropertyAmenities · data real">
        <PropertyAmenities property={property} />
      </Specimen>
      <Specimen label="PropertyLocation · data real">
        <PropertyLocation property={property} />
      </Specimen>
      <Specimen label="PropertyContactCard · con LeadForm en el slot">
        <PropertyContactCard property={property}>
          <LeadFormIdle />
        </PropertyContactCard>
      </Specimen>
    </div>
  )
}
