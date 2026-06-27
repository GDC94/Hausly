import { describe, expect, it } from "vitest"
import { isActivePath } from "./is-active-path"

describe("isActivePath", () => {
  it("marca la home solo en coincidencia exacta", () => {
    expect(isActivePath("/", "/")).toBe(true)
    expect(isActivePath("/propiedades", "/")).toBe(false)
  })

  it("marca una sección en coincidencia exacta", () => {
    expect(isActivePath("/propiedades", "/propiedades")).toBe(true)
    expect(isActivePath("/contacto", "/contacto")).toBe(true)
  })

  it("marca la sección activa en rutas anidadas (zona, detalle)", () => {
    expect(isActivePath("/propiedades/zona/palermo", "/propiedades")).toBe(true)
    expect(isActivePath("/propiedades/casa-en-nunez", "/propiedades")).toBe(true)
  })

  it("no marca secciones que solo comparten prefijo de string", () => {
    expect(isActivePath("/propiedades-destacadas", "/propiedades")).toBe(false)
  })

  it("no marca una sección no relacionada", () => {
    expect(isActivePath("/contacto", "/propiedades")).toBe(false)
  })

  it("ignora la barra final del pathname", () => {
    expect(isActivePath("/propiedades/", "/propiedades")).toBe(true)
    expect(isActivePath("/", "/")).toBe(true)
  })
})
