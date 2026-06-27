// API pública del feature `properties`. `app/` y otros consumidores importan
// SOLO desde acá, nunca de subcarpetas internas (regla AGENTS.md).
export { PropertyCard } from "./components/property-card"
export { PropertyGrid } from "./components/property-grid"
export { getProperties } from "./queries/get-properties"
export type { PropertyCardData } from "./types"
