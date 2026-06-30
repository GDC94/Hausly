import { getZones, HomeSearch } from "@/features/search"
import { ContactCta, Hero, WhyUs } from "@/shared/ui/home"
import { Specimen } from "../_components/specimen"

/**
 * Sección `home` (specs/STYLEGUIDE.md §5): bloques del home con data real (`zones`,
 * `zonesCount`). Hero lleva HomeSearch en su slot, espejando el wiring del home real.
 */
export async function HomeSection() {
  const zones = await getZones()

  return (
    <div className="flex flex-col gap-10">
      <Specimen label="Hero · con HomeSearch en el slot">
        <Hero>
          <HomeSearch zones={zones} />
        </Hero>
      </Specimen>
      <Specimen label="HomeSearch · zones reales">
        <HomeSearch zones={zones} />
      </Specimen>
      <Specimen label="WhyUs · zonesCount real">
        <WhyUs zonesCount={zones.length} />
      </Specimen>
      <Specimen label="ContactCta">
        <ContactCta />
      </Specimen>
    </div>
  )
}
