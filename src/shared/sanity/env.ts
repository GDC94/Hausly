import { z } from "zod"

/**
 * Contrato del env de Sanity. projectId/dataset son públicos (los usa el Studio
 * en el cliente, de ahí NEXT_PUBLIC_). El token de lectura es server-only y se
 * valida donde se usa (client.ts), nunca acá (que corre también en el cliente).
 */
const schema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1, "Falta NEXT_PUBLIC_SANITY_PROJECT_ID"),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1, "Falta NEXT_PUBLIC_SANITY_DATASET"),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().min(1).default("2025-01-01"),
})

export interface SanityEnv {
  projectId: string
  dataset: string
  apiVersion: string
}

/** Función pura (testeable): valida un record de env y devuelve la config tipada. */
export function parseSanityEnv(source: Record<string, string | undefined>): SanityEnv {
  const parsed = schema.parse(source)
  return {
    projectId: parsed.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: parsed.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: parsed.NEXT_PUBLIC_SANITY_API_VERSION,
  }
}

let cached: SanityEnv | undefined

/** Lee + valida el env del proceso una sola vez. Lazy: importar este módulo no
 *  dispara la validación (así el test de parseSanityEnv no depende del entorno). */
export function getSanityEnv(): SanityEnv {
  if (!cached) cached = parseSanityEnv(process.env)
  return cached
}
