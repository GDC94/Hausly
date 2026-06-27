import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SiteHeader } from "./site-header"

const pathname = vi.hoisted(() => ({ value: "/" }))

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

beforeEach(() => {
  pathname.value = "/"
})

describe("SiteHeader", () => {
  it("renderiza el logo enlazado a la home", () => {
    render(<SiteHeader />)
    const home = screen.getByRole("link", { name: /hausly/i })
    expect(home).toHaveAttribute("href", "/")
  })

  it("renderiza la nav principal con sus tres destinos", () => {
    render(<SiteHeader />)
    const nav = screen.getByRole("navigation", { name: /principal/i })
    expect(within(nav).getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/")
    expect(within(nav).getByRole("link", { name: "Propiedades" })).toHaveAttribute(
      "href",
      "/propiedades",
    )
    expect(within(nav).getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto")
  })

  it("marca con aria-current la sección activa (incl. rutas anidadas)", () => {
    pathname.value = "/propiedades/zona/palermo"
    render(<SiteHeader />)
    const nav = screen.getByRole("navigation", { name: /principal/i })
    expect(within(nav).getByRole("link", { name: "Propiedades" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    expect(within(nav).getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current")
  })

  it("expone un CTA de contacto", () => {
    render(<SiteHeader />)
    expect(screen.getByRole("link", { name: /contactar/i })).toHaveAttribute("href", "/contacto")
  })

  it("el menú mobile abre y cierra por teclado (aria-expanded + Escape)", async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    const toggle = screen.getByRole("button", { name: /abrir menú/i })
    expect(toggle).toHaveAttribute("aria-expanded", "false")

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    // El panel mobile expone los mismos destinos.
    const dialog = screen.getByRole("dialog", { name: /menú/i })
    expect(within(dialog).getByRole("link", { name: "Propiedades" })).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(toggle).toHaveAttribute("aria-expanded", "false")
  })
})
