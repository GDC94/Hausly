import Link from "next/link"
import { SECTIONS } from "./_lib/sections"

/**
 * Índice del laboratorio (specs/STYLEGUIDE.md §3): lista enlazada de las secciones del
 * catálogo, alimentada por el registro (fuente única). Cada sección es deep-linkable.
 */
export default function StyleguideIndex() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading text-foreground">Catálogo de componentes</h1>
        <p className="text-body text-muted-foreground">
          Banco de revisión: cada componente aislado, con data real y estados borde.
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {SECTIONS.map((section) => (
          <li key={section.key}>
            <Link
              href={`/styleguide/${section.key}`}
              className="flex flex-col gap-1 py-4 transition-colors hover:text-primary"
            >
              <span className="text-body font-medium">{section.title}</span>
              <span className="text-body-sm text-muted-foreground">{section.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
