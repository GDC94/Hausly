import type { VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { inputVariants } from "./input"

// `Textarea` comparte el chrome de `Input` (mismo `inputVariants`: borde, focus,
// aria-invalid) pero su altura la da el contenido (`rows`), no la escala de altura
// fija. El `size` mapea a una altura mínima (su análogo de la escala). Server-safe.
const textareaMinHeight = {
  xs: "min-h-16",
  sm: "min-h-18",
  default: "min-h-20",
  lg: "min-h-28",
} as const

function Textarea({
  className,
  size = "default",
  ref,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof inputVariants>) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        inputVariants({ size }),
        "h-auto py-2 leading-relaxed",
        textareaMinHeight[size ?? "default"],
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
