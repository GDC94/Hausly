"use client"

import { useRouter } from "next/navigation"
import { OPERATION_LABELS } from "@/shared/lib/labels"
import type { ZonesQueryResult } from "@/shared/sanity/sanity.types"
import { OPERATION_TYPES } from "@/shared/types"
import { Button } from "@/shared/ui/button"

/**
 * Barra de búsqueda compacta del hero (specs/LAYOUT.md §3): *entry point* al
 * listado, NO filtra acá (la URL es la única fuente de verdad, specs/FILTERS.md §3).
 *
 * Isla client mínima (progressive enhancement): el `<form method="get">` navega a
 * `/propiedades` igual sin JS, pero con JS el `onSubmit` **omite los controles
 * vacíos** antes de navegar. Sin esto, "Cualquiera"/"Todas" mandan `operation=&zone=`
 * y se aterriza en `/propiedades?operation=&zone=` → variante `noindex` en vez del
 * canónico `/propiedades` (ver `generateMetadata` del listado).
 *
 * Operación + Zona alcanzan para entrar al listado con filtros aplicados; el resto
 * de las facetas (precio, etc.) viven en el panel completo de `/propiedades`.
 */
export function HomeSearch({ zones }: { zones: ZonesQueryResult }) {
  const router = useRouter()
  const validZones = zones.filter((z): z is { slug: string; name: string } =>
    Boolean(z.slug && z.name),
  )

  return (
    <form
      method="get"
      action="/propiedades"
      // Inline → TS infiere el tipo del evento desde `onSubmit` (evita el símbolo
      // `React.FormEvent`, deprecado en @types/react 19).
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const params = new URLSearchParams()
        for (const [key, value] of data.entries()) {
          if (typeof value === "string" && value.trim()) params.set(key, value)
        }
        const query = params.toString()
        router.push(query ? `/propiedades?${query}` : "/propiedades")
      }}
      className="flex flex-col gap-3 rounded-xl bg-background/95 p-4 shadow-lg sm:flex-row sm:items-end sm:gap-3"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="home-operation" className="text-caption font-medium text-foreground">
          Operación
        </label>
        <select id="home-operation" name="operation" defaultValue="" className={selectClass}>
          <option value="">Cualquiera</option>
          {OPERATION_TYPES.map((value) => (
            <option key={value} value={value}>
              {OPERATION_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="home-zone" className="text-caption font-medium text-foreground">
          Zona
        </label>
        <select id="home-zone" name="zone" defaultValue="" className={selectClass}>
          <option value="">Todas</option>
          {validZones.map((zone) => (
            <option key={zone.slug} value={zone.slug}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="lg" className="h-11 sm:w-auto">
        Buscar
      </Button>
    </form>
  )
}

const selectClass =
  "h-11 rounded-md border bg-background px-3 text-body-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
