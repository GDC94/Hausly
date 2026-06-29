import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"

// Escala de tamaños del design system, anclada a la de `Button` (xs/sm/default/lg →
// h-6/h-8/h-9/h-10). Single-source: la reusan `Input`, `Textarea` y `Select` para
// hablar el mismo vocabulario de tamaño (issue #35).
const fieldSize = {
  xs: "h-6",
  sm: "h-8",
  default: "h-9",
  lg: "h-10",
} as const

// Chrome compartido de los controles de texto. Extrae el estilo de input que vivía
// duplicado como string en LeadForm/SearchFilters. El estado de error se hornea vía
// `aria-invalid` (no como variante manual) — es lo correcto a11y y como RHF/`Field`
// ya lo marcan. Server-safe.
const inputVariants = cva(
  "w-full rounded-md border bg-background px-3 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: fieldSize,
    },
    defaultVariants: {
      size: "default",
    },
  },
)

// `Omit<…, "size">`: `<input>` tiene un atributo nativo `size` (number) que choca con
// la variante `size` del cva (string). Se omite el nativo (casi nunca se usa).
function Input({
  className,
  size,
  ref,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      ref={ref}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { fieldSize, Input, inputVariants }
