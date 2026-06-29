import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"

// Label canónico del design system (issue #35). Unifica los 3 estilos de label que
// vivían sueltos en los forms: el molde es uno solo (`text-body-sm`) y el `tone`
// cubre el caso secundario (filtros) sin reinventar tipografía. Server-safe.
const labelVariants = cva("text-body-sm", {
  variants: {
    tone: {
      default: "font-medium text-foreground",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: {
    tone: "default",
  },
})

function Label({
  className,
  tone,
  ref,
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: átomo del design system — la asociación con el control la hace `htmlFor` (inyectado por `Field` o pasado por el consumidor); verificado por field.test.tsx.
    <label
      ref={ref}
      data-slot="label"
      className={cn(labelVariants({ tone }), className)}
      {...props}
    />
  )
}

export { Label, labelVariants }
