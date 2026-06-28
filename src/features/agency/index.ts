// API pública del feature `agency`. `app/` y otros consumidores importan SOLO
// desde acá, nunca de subcarpetas internas (regla AGENTS.md).
export { type AgencyData, buildAgencyJsonLd } from "./lib/agency-json-ld"
export { getAgency } from "./queries/get-agency"
