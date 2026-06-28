import type { PropertyDetail } from "../types"

/**
 * Bloque "¿Dónde queda?" (specs/LAYOUT.md §7). Mapa estático **diferido** (issue
 * posterior): por ahora zona + dirección + link a Google Maps (cero JS, cero key).
 *
 * **Privacidad** (specs/SANITY-SCHEMA.md §4): la dirección exacta y las coords
 * sólo se muestran si `showAddress === true`. Si no, se revela sólo la zona y el
 * link de Maps busca la zona (coarse) — nunca la ubicación exacta de una
 * propiedad de dirección oculta.
 */
export function PropertyLocation({ property }: { property: PropertyDetail }) {
  const location = property.location
  const zone = location?.zone?.name
  const showAddress = location?.showAddress === true
  const address = showAddress ? location?.address : null
  const geo = showAddress ? location?.geopoint : null

  if (!zone && !address) return null

  const mapsQuery =
    geo?.lat != null && geo.lng != null ? `${geo.lat},${geo.lng}` : (address ?? zone ?? "")
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`

  return (
    <section aria-labelledby="location-heading">
      <h2 id="location-heading" className="text-subheading text-foreground">
        ¿Dónde queda?
      </h2>
      <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-6">
        {address ? <p className="text-body text-foreground">{address}</p> : null}
        {zone ? <p className="text-body-sm text-muted-foreground">{zone}</p> : null}
        {mapsQuery ? (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-body-sm text-link underline underline-offset-4"
          >
            Ver en Google Maps
          </a>
        ) : null}
      </div>
    </section>
  )
}
