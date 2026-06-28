import { describe, expect, it } from "vitest"
import { leadSchema } from "./lead-schema"

const base = { name: "Ana", email: "ana@mail.com" }

describe("leadSchema", () => {
  it("acepta una consulta con email", () => {
    const r = leadSchema.safeParse(base)
    expect(r.success).toBe(true)
  })

  it("acepta una consulta con teléfono y sin email", () => {
    const r = leadSchema.safeParse({ name: "Ana", phone: "+54 11 5555-1234" })
    expect(r.success).toBe(true)
  })

  it("rechaza si no hay ni email ni teléfono (una consulta sin contacto no sirve)", () => {
    const r = leadSchema.safeParse({ name: "Ana", message: "Hola" })
    expect(r.success).toBe(false)
  })

  it("trata el email vacío como ausente (no lo valida como email roto)", () => {
    const r = leadSchema.safeParse({ name: "Ana", email: "", phone: "12345" })
    expect(r.success).toBe(true)
  })

  it("rechaza un email mal formado", () => {
    const r = leadSchema.safeParse({ name: "Ana", email: "no-es-email" })
    expect(r.success).toBe(false)
  })

  it("normaliza (trim) un email pegado con espacios alrededor", () => {
    const r = leadSchema.safeParse({ name: "Ana", email: "  ana@mail.com  " })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe("ana@mail.com")
  })

  it("exige el nombre", () => {
    const r = leadSchema.safeParse({ name: "", email: "ana@mail.com" })
    expect(r.success).toBe(false)
  })

  it("source default 'form'", () => {
    const r = leadSchema.parse(base)
    expect(r.source).toBe("form")
  })

  it("acepta source 'whatsapp'", () => {
    const r = leadSchema.safeParse({ ...base, source: "whatsapp" })
    expect(r.success).toBe(true)
  })

  it("conserva el propertyId opcional (consulta por una propiedad puntual)", () => {
    const r = leadSchema.parse({ ...base, propertyId: "prop-123" })
    expect(r.propertyId).toBe("prop-123")
  })
})
