import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field } from "./field"
import { Input } from "./input"

// El `Field` es el único átomo con comportamiento (no presentational puro): centraliza
// la a11y del campo (specs/TESTING.md §2 — RTL con bisturí, por rol accesible). Se
// testea el contrato observable, no la implementación (Slot/cva son internos).
describe("Field", () => {
  it("asocia el label con el control hijo", () => {
    render(
      <Field id="name" label="Nombre">
        <input type="text" />
      </Field>,
    )

    expect(screen.getByLabelText("Nombre")).toHaveAttribute("type", "text")
  })

  it("sin error: el control no es inválido ni describe un error", () => {
    render(
      <Field id="name" label="Nombre">
        <input type="text" />
      </Field>,
    )

    const input = screen.getByLabelText("Nombre")
    expect(input).not.toHaveAttribute("aria-invalid", "true")
    expect(input).not.toHaveAttribute("aria-describedby")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("con error: lo anuncia (role=alert) y lo asocia al control (WCAG 3.3.1)", () => {
    render(
      <Field id="email" label="Email" error="Email inválido">
        <input type="email" />
      </Field>,
    )

    const input = screen.getByLabelText("Email")
    const alert = screen.getByRole("alert")

    expect(alert).toHaveTextContent("Email inválido")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(alert.id).toBeTruthy()
    expect(input).toHaveAttribute("aria-describedby", alert.id)
  })

  it("inyecta la a11y a través del átomo Input (Slot), no sólo en un <input> pelado", () => {
    render(
      <Field id="email" label="Email" error="Email inválido">
        <Input type="email" />
      </Field>,
    )

    const input = screen.getByLabelText("Email")
    expect(input.tagName).toBe("INPUT")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute("aria-describedby", "email-error")
  })
})
