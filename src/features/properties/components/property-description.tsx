import { PortableText, type PortableTextComponents } from "@portabletext/react"
import type { TypedObject } from "@portabletext/types"
import type { PropertyDetail } from "../types"

/**
 * Descripción rica (Portable Text → React, specs/SANITY-SCHEMA.md). Mapeo
 * acotado de estilos/marcas: subtítulos, párrafos, listas y links seguros
 * (`rel="noopener"`). No renderiza tipos que el editor no usa.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-body text-muted-foreground">{children}</p>,
    h2: ({ children }) => <h3 className="text-subheading text-foreground">{children}</h3>,
    h3: ({ children }) => <h4 className="text-body font-semibold text-foreground">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="rounded-lg bg-muted/40 px-4 py-3 text-body text-muted-foreground italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal space-y-1 pl-5 text-body text-muted-foreground">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link underline underline-offset-4"
      >
        {children}
      </a>
    ),
  },
}

export function PropertyDescription({ property }: { property: PropertyDetail }) {
  const blocks = property.description
  if (!blocks || blocks.length === 0) return null

  return (
    <section aria-labelledby="description-heading">
      <h2 id="description-heading" className="text-subheading text-foreground">
        Descripción
      </h2>
      <div className="mt-4 space-y-4">
        <PortableText value={blocks as unknown as TypedObject[]} components={components} />
      </div>
    </section>
  )
}
