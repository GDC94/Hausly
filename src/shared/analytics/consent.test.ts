import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// PostHog se mockea: el consentimiento se decide por nuestro flag de localStorage, no
// por el estado del SDK (esa fue la causa del bug — opt-out por default leía como
// "ya decidió" y el banner nunca se mostraba).
const posthogMock = vi.hoisted(() => ({
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  set_config: vi.fn(),
}))
vi.mock("posthog-js", () => ({ default: posthogMock }))

import { denyConsent, grantConsent, hasConsent, hasDecidedConsent } from "./consent"

describe("consent", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })
  afterEach(() => {
    window.localStorage.clear()
  })

  it("REGRESIÓN: sin decisión previa, hasDecidedConsent es false → el banner se muestra", () => {
    // El bug: PostHog arranca opt-out por default, y si el banner se guiara por
    // has_opted_out_capturing() vería una "decisión" falsa y nunca aparecería.
    expect(hasDecidedConsent()).toBe(false)
    expect(hasConsent()).toBe(false)
  })

  it("grantConsent: marca la decisión, eleva la persistencia y habilita la captura", () => {
    grantConsent()
    expect(hasConsent()).toBe(true)
    expect(hasDecidedConsent()).toBe(true)
    expect(posthogMock.set_config).toHaveBeenCalledWith({ persistence: "localStorage+cookie" })
    expect(posthogMock.opt_in_capturing).toHaveBeenCalledOnce()
  })

  it("denyConsent: registra la decisión y deja PostHog en opt-out (no captura)", () => {
    denyConsent()
    expect(hasConsent()).toBe(false)
    expect(hasDecidedConsent()).toBe(true) // decidió → el banner no reaparece
    expect(posthogMock.opt_out_capturing).toHaveBeenCalledOnce()
    expect(posthogMock.opt_in_capturing).not.toHaveBeenCalled()
  })
})
