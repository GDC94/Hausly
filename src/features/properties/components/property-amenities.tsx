import { AMENITY_LABELS } from "@/shared/lib/labels"
import type { PropertyDetail } from "../types"

type AmenityKey = keyof typeof AMENITY_LABELS

/**
 * Amenities como lista de chips (specs/LAYOUT.md §7). Sólo renderiza valores
 * conocidos del enum (`AMENITY_LABELS`); un amenity desconocido en el dato se
 * ignora en silencio en vez de mostrar un identificador crudo en inglés.
 */
export function PropertyAmenities({ property }: { property: PropertyDetail }) {
  const known = (property.amenities ?? []).filter((a): a is AmenityKey => a in AMENITY_LABELS)
  if (known.length === 0) return null

  return (
    <section aria-labelledby="amenities-heading">
      <h2 id="amenities-heading" className="text-subheading text-foreground">
        Amenities
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {known.map((amenity) => (
          <li
            key={amenity}
            className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-body-sm text-foreground"
          >
            {AMENITY_LABELS[amenity]}
          </li>
        ))}
      </ul>
    </section>
  )
}
