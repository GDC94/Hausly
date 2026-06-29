import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { fieldSize } from "./input"

// `<select>` NATIVO estilizado (issue #35). Se eligió nativo sobre un combobox custom
// para preservar el progressive-enhancement del hero (el form GET funciona sin JS) y
// el picker nativo de mobile. Extrae el estilo de select que vivía en HomeSearch; comparte
// la escala `size` con `Input` (single-source). El consumidor pasa los `<option>` como
// children. Server-safe.
const selectVariants = cva(
  "w-full rounded-md border bg-background px-3 text-body-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: fieldSize,
    },
    defaultVariants: {
      size: "default",
    },
  },
)

// `Omit<…, "size">`: `<select>` tiene atributo nativo `size` (number, filas visibles)
// que choca con la variante `size` del cva.
function Select({
  className,
  size,
  ref,
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & VariantProps<typeof selectVariants>) {
  return (
    <select
      ref={ref}
      data-slot="select"
      className={cn(selectVariants({ size }), className)}
      {...props}
    />
  )
}

export { Select, selectVariants }
