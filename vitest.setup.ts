import "@testing-library/jest-dom/vitest"

// Env público de Sanity para los tests: módulos como `shared/sanity/image` validan
// el env al importarse (Zod, min(1)). Se setea acá —no se mockean colaboradores
// internos— para ejercitar el path de import real. Valores dummy: no se hace red.
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= "test"
process.env.NEXT_PUBLIC_SANITY_DATASET ??= "test"
process.env.NEXT_PUBLIC_SANITY_API_VERSION ??= "2025-01-01"
