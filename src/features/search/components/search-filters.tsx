import Link from "next/link"
import { AMENITY_LABELS, CONDITION_LABELS, PROPERTY_TYPE_LABELS } from "@/shared/lib/labels"
import type { ZonesQueryResult } from "@/shared/sanity/sanity.types"
import { AMENITIES, CONDITIONS, PROPERTY_TYPES, type PropertyFilters } from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { PriceFunnel } from "./price-funnel"

type SearchFiltersProps = {
  /** Filtros activos (parseados de la URL) — fijan el estado inicial de los controles. */
  filters: PropertyFilters
  /** Opciones de zona desde Sanity para la faceta correspondiente. */
  zones: ZonesQueryResult
}

/**
 * Panel de facetas (specs/FILTERS.md §1,§3). Es un `<form method="get">` puro:
 * al enviar, el navegador navega a `/propiedades?…` y el Server Component
 * re-renderiza el listado filtrado. **La URL es la única fuente de verdad** — no
 * hay estado de cliente duplicado (specs/ARCHITECTURE.md §3). Por eso es un
 * Server Component sin `"use client"`: los valores actuales vienen de `filters`.
 *
 * Cada faceta es un `<fieldset>` con `<legend>` para que el lector de pantalla
 * anuncie el grupo (specs/SEO.md §6). Precio/operación/moneda llegan en el
 * issue #7 (su revelado contextual depende de la operación, specs/FILTERS.md §2).
 */
export function SearchFilters({ filters, zones }: SearchFiltersProps) {
  return (
    // `key` derivada de los filtros activos: los controles son uncontrolled
    // (`defaultChecked`/`defaultValue`), así que sin esto una navegación soft
    // (el `<Link>` de "Limpiar", el botón atrás) reconciliaría el form sin
    // remontarlo y dejaría tildes/valores viejos en el DOM mientras la URL ya
    // cambió — rompiendo "URL = única fuente de verdad". Cambiar la key fuerza
    // el remount → los controles se rehidratan desde la URL nueva.
    <form
      key={JSON.stringify(filters)}
      method="get"
      action="/propiedades"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-q" className="text-body-sm font-medium text-foreground">
          Buscar
        </label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={filters.q ?? ""}
          placeholder="Código, título o dirección"
          className="h-9 rounded-md border bg-background px-3 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      <PriceFunnel filters={filters} />

      <CheckboxGroup
        legend="Tipo"
        name="type"
        options={PROPERTY_TYPES.map((value) => ({
          value,
          label: PROPERTY_TYPE_LABELS[value],
        }))}
        selected={filters.types}
      />

      {zones.length > 0 && (
        <CheckboxGroup
          legend="Zona"
          name="zone"
          options={zones
            .filter((zone): zone is { slug: string; name: string } =>
              Boolean(zone.slug && zone.name),
            )
            .map((zone) => ({ value: zone.slug, label: zone.name }))}
          selected={filters.zones}
        />
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-body-sm font-medium text-foreground">Ambientes y superficie</legend>
        <div className="grid grid-cols-2 gap-3">
          <MinNumberField
            id="filter-rooms"
            name="rooms"
            label="Ambientes (mín.)"
            value={filters.rooms}
          />
          <MinNumberField
            id="filter-bathrooms"
            name="bathrooms"
            label="Baños (mín.)"
            value={filters.bathrooms}
          />
          <MinNumberField
            id="filter-parking"
            name="parking"
            label="Cocheras (mín.)"
            value={filters.parking}
          />
          <MinNumberField
            id="filter-areaMin"
            name="areaMin"
            label="m² desde"
            value={filters.areaMin}
          />
          <MinNumberField
            id="filter-areaMax"
            name="areaMax"
            label="m² hasta"
            value={filters.areaMax}
          />
        </div>
      </fieldset>

      <CheckboxGroup
        legend="Estado"
        name="condition"
        options={CONDITIONS.map((value) => ({ value, label: CONDITION_LABELS[value] }))}
        selected={filters.conditions}
      />

      <CheckboxGroup
        legend="Amenities"
        name="amenities"
        options={AMENITIES.map((value) => ({ value, label: AMENITY_LABELS[value] }))}
        selected={filters.amenities}
      />

      <div className="flex flex-col gap-2">
        <Button type="submit">Aplicar filtros</Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/propiedades">Limpiar filtros</Link>
        </Button>
      </div>
    </form>
  )
}

type CheckboxOption = { value: string; label: string }

function CheckboxGroup({
  legend,
  name,
  options,
  selected,
}: {
  legend: string
  name: string
  options: CheckboxOption[]
  selected: readonly string[] | undefined
}) {
  const active = new Set(selected)
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-body-sm font-medium text-foreground">{legend}</legend>
      <div className="flex flex-col gap-1.5">
        {options.map((option) => {
          const id = `filter-${name}-${option.value}`
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="flex items-center gap-2 text-body-sm text-foreground"
            >
              <input
                id={id}
                type="checkbox"
                name={name}
                value={option.value}
                defaultChecked={active.has(option.value)}
                className="size-4 rounded border accent-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function MinNumberField({
  id,
  name,
  label,
  value,
}: {
  id: string
  name: string
  label: string
  value: number | undefined
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={1}
        defaultValue={value ?? ""}
        className="h-9 rounded-md border bg-background px-3 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  )
}
