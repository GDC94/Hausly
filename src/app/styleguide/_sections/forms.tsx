import { getZones, parseSearchParams, SearchFilters } from "@/features/search"
import { Specimen } from "@/shared/styleguide"
import { LeadFormStates } from "../_components/lead-form-specimens"

/**
 * Sección `forms` (specs/STYLEGUIDE.md §5): LeadForm en sus 3 estados (vía LeadFormView,
 * sin disparar la acción) y SearchFilters con `zones` reales. PriceFunnel se exhibe
 * dentro de SearchFilters (su padre) — revelado por operación.
 */
export async function FormsSection() {
  const zones = await getZones()
  const filters = parseSearchParams({})

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">LeadForm</h3>
        <LeadFormStates />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-body font-semibold text-foreground">
          SearchFilters <span className="text-muted-foreground">(incluye PriceFunnel)</span>
        </h3>
        <Specimen label="SearchFilters · zones reales">
          <SearchFilters filters={filters} zones={zones} />
        </Specimen>
      </section>
    </div>
  )
}
