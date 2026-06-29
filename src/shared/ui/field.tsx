import { Slot } from "radix-ui"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Label } from "./label"

type FieldProps = {
  /** Id del control: liga el `<label htmlFor>` y se inyecta en el hijo vía `Slot`. */
  id: string
  label: string
  /** Mensaje de error. Su presencia activa `aria-invalid` + `aria-describedby`. */
  error?: string
  /** `muted` para campos secundarios (ej. filtros). */
  tone?: React.ComponentProps<typeof Label>["tone"]
  className?: string
  /** Único control (input/textarea/select). `Slot` le fusiona la a11y del campo. */
  children: React.ReactNode
}

/**
 * Campo etiquetado del design system (issue #35). Centraliza la accesibilidad del
 * control en UN lugar (no librada a cada consumidor): vía el `Slot` de radix le
 * inyecta `id`, `aria-invalid` (derivado de `error`) y `aria-describedby` → el
 * mensaje de error (WCAG 3.3.1, antes ausente). Toma `id` explícito a propósito —
 * `useId` es hook y volvería el componente client-only, rompiendo su uso en RSC
 * (`SearchFilters`). Server-safe: sólo markup + `Slot` + `cn`.
 */
function Field({ id, label, error, tone, className, children }: FieldProps) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div data-slot="field" className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} tone={tone}>
        {label}
      </Label>
      <Slot.Root id={id} aria-invalid={error ? true : undefined} aria-describedby={errorId}>
        {children}
      </Slot.Root>
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Field }
