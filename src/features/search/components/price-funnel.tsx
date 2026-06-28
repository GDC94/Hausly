"use client"

import { useState } from "react"
import { OPERATION_LABELS } from "@/shared/lib/labels"
import { CURRENCIES, OPERATION_TYPES, type PropertyFilters } from "@/shared/types"

/**
 * Embudo operación → moneda → precio con **revelado inline** (specs/FILTERS.md §5).
 *
 * Es el único trozo client del panel: el revelado progresivo necesita estado de
 * UI (qué bloque mostrar) ANTES del submit. Pero los inputs siguen siendo parte
 * del `<form method="get">` del panel, así que **la URL sigue siendo la única
 * fuente de verdad** — el estado local sólo decide visibilidad, no filtra.
 *
 * Orden del embudo: sin operación, no hay moneda; sin moneda, no hay precio. Es
 * deliberado (specs/FILTERS.md §2): `priceMin/Max` sin `currency` no tienen
 * sentido (no hay conversión USD↔ARS, Non-Goal), y `currency` es un filtro
 * **explícito** — el sistema no adivina la moneda cuando una propiedad está en
 * ambas. El revelado anima sólo opacity/transform (`motion-safe`, DESIGN §8).
 */
export function PriceFunnel({ filters }: { filters: PropertyFilters }) {
  const [operation, setOperation] = useState<string>(filters.operation ?? "")
  const [currency, setCurrency] = useState<string>(filters.currency ?? "")

  function handleOperation(value: string) {
    setOperation(value)
    // Limpiar la operación arrastra moneda (y precio): mantiene el embudo coherente.
    if (!value) setCurrency("")
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-body-sm font-medium text-foreground">Operación y precio</legend>

      <Segmented
        name="operation"
        ariaLabel="Operación"
        value={operation}
        onChange={handleOperation}
        options={[
          { value: "", label: "Cualquiera" },
          ...OPERATION_TYPES.map((value) => ({ value, label: OPERATION_LABELS[value] })),
        ]}
      />

      {operation && (
        <div className="flex flex-col gap-3 motion-safe:animate-reveal">
          <Segmented
            name="currency"
            label="Moneda"
            ariaLabel="Moneda"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: "", label: "Cualquiera" },
              ...CURRENCIES.map((value) => ({ value, label: value })),
            ]}
          />

          {currency && (
            <div className="grid grid-cols-2 gap-3 motion-safe:animate-reveal">
              <PriceField
                name="priceMin"
                label={`Mínimo (${currency})`}
                defaultValue={filters.priceMin}
              />
              <PriceField
                name="priceMax"
                label={`Máximo (${currency})`}
                defaultValue={filters.priceMax}
              />
            </div>
          )}
        </div>
      )}
    </fieldset>
  )
}

type SegmentedOption = { value: string; label: string }

function Segmented({
  name,
  label,
  ariaLabel,
  options,
  value,
  onChange,
}: {
  name: string
  label?: string
  ariaLabel: string
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-body-sm text-muted-foreground">{label}</span>}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1 rounded-md border bg-background p-1"
      >
        {options.map((option) => (
          <label key={option.value || "any"} className="flex-1">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="block cursor-pointer rounded-sm px-3 py-1.5 text-center text-body-sm whitespace-nowrap text-muted-foreground transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 hover:text-foreground">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function PriceField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue: number | undefined
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`filter-${name}`} className="text-body-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={`filter-${name}`}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        defaultValue={defaultValue ?? ""}
        className="h-9 rounded-md border bg-background px-3 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  )
}
