// API pública del feature `leads`. `app/` y otros consumidores importan SOLO desde
// acá, nunca de subcarpetas internas (regla AGENTS.md).
export { LeadForm } from "./components/lead-form"
export { type LeadInput, leadSchema } from "./schemas/lead-schema"
