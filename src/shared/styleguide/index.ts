// API pública del módulo `styleguide` compartido: lo feature-agnóstico del laboratorio
// (specs/STYLEGUIDE.md). La orquestación que compone features (secciones, registro,
// derive) vive en `app/styleguide/` porque componer varios features es trabajo de `app/`
// (AGENTS.md: un page.tsx orquesta queries + componentes de features/*). `shared/` es la
// capa base y no puede importar features.
export { isBlocked } from "./guard"
export { Specimen } from "./specimen"
