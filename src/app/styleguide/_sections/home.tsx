import { getZones, HomeSearch } from "@/features/search"
import { Specimen } from "@/shared/styleguide"
import { ContactCta, Hero, WhyUs } from "@/shared/ui/home"

/**
 * Sección `home` (specs/STYLEGUIDE.md §5): bloques del home con data real (`zones`,
 * `zonesCount`). Hero lleva HomeSearch en su slot, espejando el wiring del home real.
 */
export async function HomeSection() {
  const zones = await getZones()

  return (
    <div className="flex flex-col gap-10">
      {/* HomeSearch se exhibe DENTRO del Hero (su wiring real). No se monta un segundo
          HomeSearch standalone: hardcodea ids (`home-operation`/`home-zone`) y dos copias
          en la misma página colisionarían (a11y). */}
      <Specimen label="Hero · con HomeSearch en el slot">
        <Hero>
          <HomeSearch zones={zones} />
        </Hero>
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
