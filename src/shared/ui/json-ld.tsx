import type { Thing, WithContext } from "schema-dts"

/**
 * Inyecta datos estructurados como `<script type="application/ld+json">`
 * (specs/SEO.md §4). El `<` se escapa a `<` para que un `</script>` dentro
 * de los datos (ej. una descripción) no rompa el documento ni habilite XSS.
 */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: patrón canónico de JSON-LD; el payload es nuestro y va escapado.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
