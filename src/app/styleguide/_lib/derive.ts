import type { PropertyCardData } from "@/features/properties/types"

/**
 * Helpers de estados borde de la vitrina `/styleguide` (specs/STYLEGUIDE.md §4).
 *
 * **Contrato: funciones PURAS que COPIAN un doc real, nunca mutan el input.** Los
 * objetos en JS pasan por referencia: si mutaran el doc, corromperían la card "data
 * real" que sale del mismo doc en la misma página de la vitrina. Por eso cada helper
 * devuelve un objeto nuevo (`{ ...p, … }`). Tipados contra TypeGen → si el schema
 * cambia, la vitrina rompe en `tsc`, no en runtime. **Cero fixtures que mantener.**
 */

/** Copia de la tarjeta sin imagen → ejercita el placeholder/estado sin foto. */
export function withoutImage(property: PropertyCardData): PropertyCardData {
  return { ...property, mainImage: null }
}

const LONG_TITLE =
  "Espectacular departamento de tres ambientes con dependencia, balcón aterrazado y vista abierta al parque en el corazón de Palermo Soho"

/** Copia de la tarjeta con un título largo → ejercita overflow/truncado del layout. */
export function withLongTitle(property: PropertyCardData): PropertyCardData {
  return { ...property, title: LONG_TITLE }
}

/** Grilla vacía → ejercita el estado "sin resultados". */
export function emptyGrid(): PropertyCardData[] {
  return []
}
