import { describe, expect, it, vi } from "vitest"
import type { LeadInput } from "../schemas/lead-schema"
import { createLead } from "./create-lead"
import type { LeadAnalytics, LeadNotifier, LeadRepo } from "./ports"

const input: LeadInput = { name: "Ana", email: "ana@mail.com", source: "form" }

/** Fakes que registran el ORDEN de las llamadas en una línea de tiempo compartida. */
function fakes(opts: { notifierThrows?: boolean; analyticsThrows?: boolean } = {}) {
  const timeline: string[] = []
  const repo: LeadRepo = {
    save: vi.fn(async () => {
      timeline.push("save")
      return { _id: "lead-1" }
    }),
  }
  const notifier: LeadNotifier = {
    notify: vi.fn(async () => {
      timeline.push("notify")
      if (opts.notifierThrows) throw new Error("Resend caído")
    }),
  }
  const analytics: LeadAnalytics = {
    track: vi.fn(async () => {
      timeline.push("track")
      if (opts.analyticsThrows) throw new Error("PostHog caído")
    }),
  }
  return { timeline, repo, notifier, analytics }
}

describe("createLead", () => {
  it("persiste el lead y devuelve su id", async () => {
    const { repo, notifier, analytics } = fakes()
    const result = await createLead(input, { repo, notifier, analytics })
    expect(repo.save).toHaveBeenCalledWith(input)
    expect(result.id).toBe("lead-1")
    expect(result.notified).toBe(true)
  })

  it("PERSISTE ANTES DE NOTIFICAR (invariante de orden)", async () => {
    const { timeline, repo, notifier, analytics } = fakes()
    await createLead(input, { repo, notifier, analytics })
    expect(timeline.indexOf("save")).toBeLessThan(timeline.indexOf("notify"))
  })

  it("si el notifier falla, el lead IGUAL quedó guardado y no se rompe", async () => {
    const { timeline, repo, notifier, analytics } = fakes({ notifierThrows: true })
    const result = await createLead(input, { repo, notifier, analytics })
    expect(repo.save).toHaveBeenCalledOnce()
    expect(timeline).toContain("save")
    expect(result.id).toBe("lead-1")
    expect(result.notified).toBe(false)
  })

  it("si persistir falla, NO notifica (no hay lead que avisar) y propaga el error", async () => {
    const notifier: LeadNotifier = { notify: vi.fn() }
    const analytics: LeadAnalytics = { track: vi.fn() }
    const repo: LeadRepo = {
      save: vi.fn(async () => {
        throw new Error("Sanity caído")
      }),
    }
    await expect(createLead(input, { repo, notifier, analytics })).rejects.toThrow("Sanity caído")
    expect(notifier.notify).not.toHaveBeenCalled()
  })

  it("trackea analytics pero un fallo de analytics no rompe la consulta", async () => {
    const { repo, notifier, analytics } = fakes({ analyticsThrows: true })
    const result = await createLead(input, { repo, notifier, analytics })
    expect(analytics.track).toHaveBeenCalledOnce()
    expect(result.id).toBe("lead-1")
    expect(result.notified).toBe(true)
  })
})
