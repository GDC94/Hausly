import { describe, expect, it } from "vitest"
import { parseSanityEnv } from "./env"

describe("parseSanityEnv", () => {
  it("parsea un env válido", () => {
    expect(
      parseSanityEnv({
        NEXT_PUBLIC_SANITY_PROJECT_ID: "r15bgrsw",
        NEXT_PUBLIC_SANITY_DATASET: "production",
      }),
    ).toEqual({
      projectId: "r15bgrsw",
      dataset: "production",
      apiVersion: "2025-01-01",
    })
  })

  it("respeta un apiVersion explícito", () => {
    const env = parseSanityEnv({
      NEXT_PUBLIC_SANITY_PROJECT_ID: "r15bgrsw",
      NEXT_PUBLIC_SANITY_DATASET: "production",
      NEXT_PUBLIC_SANITY_API_VERSION: "2024-10-01",
    })
    expect(env.apiVersion).toBe("2024-10-01")
  })

  it("falla si falta projectId", () => {
    expect(() => parseSanityEnv({ NEXT_PUBLIC_SANITY_DATASET: "production" })).toThrow()
  })

  it("falla si falta dataset", () => {
    expect(() => parseSanityEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "r15bgrsw" })).toThrow()
  })
})
