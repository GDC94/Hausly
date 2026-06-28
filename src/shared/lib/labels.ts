/**
 * Etiquetas de display (español) para los enums del dominio. El identificador
 * en inglés es el lenguaje ubicuo (specs/DOMAIN.md); acá sólo se traduce para la
 * UI. Fuente de los valores: specs/SANITY-SCHEMA.md §6.
 *
 * Vive en `shared/lib` porque lo consumen varios features (la card de
 * `properties` y los controles de `search`): un concepto = una fuente.
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

export const AMENITY_LABELS = {
  pool: "Pileta",
  grill: "Parrilla",
  communityRoom: "SUM",
  gym: "Gimnasio",
  security24h: "Seguridad 24h",
  laundry: "Laundry",
  solarium: "Solárium",
  visitorParking: "Cochera de visitas",
} as const
