import { OPERATION_LABELS } from "@/shared/lib/labels"
import type { ZonesQueryResult } from "@/shared/sanity/sanity.types"
import { OPERATION_TYPES } from "@/shared/types"
import { Button } from "@/shared/ui/button"

/**
 * Barra de búsqueda compacta del hero (specs/LAYOUT.md §3). NO filtra acá: es un
 * `<form method="get">` que **navega** a `/propiedades?operation=…&zone=…` — un
 * *entry point*, no estado de cliente (la URL es la única fuente de verdad,
 * specs/FILTERS.md §3). Server Component sin `"use client"`: HTML puro.
 *
 * Operación + Zona alcanzan para entrar al listado con filtros aplicados; el resto
 * de las facetas (precio, etc.) viven en el panel completo de `/propiedades`.
 */
export function HomeSearch({ zones }: { zones: ZonesQueryResult }) {
  const validZones = zones.filter((z): z is { slug: string; name: string } =>
    Boolean(z.slug && z.name),
  )

  return (
    <form
      method="get"
      action="/propiedades"
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
