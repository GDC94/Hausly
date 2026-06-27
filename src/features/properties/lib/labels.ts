/**
 * Etiquetas de display (español) para los enums del dominio. El identificador
 * en inglés es el lenguaje ubicuo (specs/DOMAIN.md); acá sólo se traduce para la
 * UI. Fuente de los valores: specs/SANITY-SCHEMA.md §6.
 */

export const OPERATION_LABELS = {
  sale: "Venta",
  rent: "Alquiler",
  temporaryRent: "Alquiler temporario",
} as const

export const PROPERTY_TYPE_LABELS = {
  house: "Casa",
  apartment: "Departamento",
  ph: "PH",
  land: "Terreno",
  commercial: "Local",
  office: "Oficina",
  warehouse: "Galpón",
  garage: "Cochera",
  farm: "Campo",
} as const

export const CONDITION_LABELS = {
  brandNew: "A estrenar",
  used: "Usado",
  preConstruction: "En pozo",
} as const
