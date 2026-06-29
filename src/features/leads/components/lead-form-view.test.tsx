import { render, screen } from "@testing-library/react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"

import type { LeadFormValues } from "../schemas/lead-schema"
import { LeadFormView } from "./lead-form-view"

// `LeadFormView` es la VISTA presentacional pura del LeadForm (specs/STYLEGUIDE.md §5
// nota `forms`): recibe `register`/`errors`/`pending`/`serverState`/`onSubmit` y SOLO
// decide markup — form (idle/error) vs panel de éxito. Sin `useForm`, sin Server Action,
// sin analytics. Por eso la vitrina puede pintar los 3 estados sin tocar Sanity ni crear
// leads basura. El container (LeadForm) inyecta RHF; acá se inyecta un `register` noop.

const noopRegister = ((name: string) => ({
  name,
  onChange: async () => {},
  onBlur: async () => {},
  ref: () => {},
})) as unknown as UseFormRegister<LeadFormValues>

const noErrors = {} as FieldErrors<LeadFormValues>

function renderView(props: Partial<React.ComponentProps<typeof LeadFormView>> = {}) {
  return render(
    <LeadFormView
      register={noopRegister}
      errors={noErrors}
      pending={false}
      serverState={null}
      onSubmit={vi.fn((e) => e.preventDefault())}
      {...props}
    />,
  )
}

describe("LeadFormView", () => {
  it("idle: rinde el form con sus campos y el botón habilitado, sin panel de éxito ni error server", () => {
    renderView()

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument()
    expect(screen.getByLabelText("Mensaje")).toBeInTheDocument()

    const submit = screen.getByRole("button", { name: "Enviar consulta" })
    expect(submit).toBeEnabled()

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("error: muestra el mensaje de error server-side (role=alert) y conserva el form", () => {
    renderView({
      serverState: { status: "error", message: "Revisá los datos del formulario." },
    })

    expect(screen.getByRole("alert")).toHaveTextContent("Revisá los datos del formulario.")
    // El form sigue presente para corregir y reenviar.
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("éxito: muestra el panel de éxito (role=status) y NO rinde el form", () => {
    renderView({
      serverState: { status: "success", message: "¡Gracias! Te contactamos a la brevedad." },
    })

    expect(screen.getByRole("status")).toHaveTextContent("¡Gracias! Te contactamos a la brevedad.")
    expect(screen.queryByLabelText("Nombre")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Enviar consulta" })).not.toBeInTheDocument()
  })

  it("pending: el botón queda deshabilitado y anuncia el envío en curso", () => {
    renderView({ pending: true })

    const submit = screen.getByRole("button", { name: "Enviando…" })
    expect(submit).toBeDisabled()
  })

  it("invoca onSubmit al enviar el form", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    renderView({ onSubmit })

    screen.getByRole("button", { name: "Enviar consulta" }).click()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
