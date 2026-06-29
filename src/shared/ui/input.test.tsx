import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"

import { Input } from "./input"
import { Select } from "./select"
import { Textarea } from "./textarea"

// Tests finos: estos átomos son presentacionales, pero el refactor depende de un
// contrato observable — reenvían el `ref` al nodo nativo (necesario para
// `{...register()}` de react-hook-form) y renderizan el elemento nativo correcto
// (necesario para la semántica de `<form>`).
describe("Input", () => {
  it("reenvía el ref al <input> nativo y propaga props", () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} name="email" type="email" aria-label="Email" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email")
  })
})

describe("Textarea", () => {
  it("renderiza un <textarea> y reenvía el ref", () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} aria-label="Mensaje" rows={4} />)

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(screen.getByLabelText("Mensaje")).toHaveAttribute("rows", "4")
  })
})

describe("Select", () => {
  it("renderiza un <select> nativo con sus opciones", () => {
    render(
      <Select aria-label="Operación" defaultValue="">
        <option value="">Cualquiera</option>
        <option value="sale">Venta</option>
      </Select>,
    )

    expect(screen.getByLabelText("Operación").tagName).toBe("SELECT")
    expect(screen.getByRole("option", { name: "Venta" })).toBeInTheDocument()
  })
})
