import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SITE } from "@/shared/config/site"
import { SiteFooter } from "./site-footer"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("SiteFooter", () => {
  it("es un landmark contentinfo con la marca", () => {
    render(<SiteFooter />)
    const footer = screen.getByRole("contentinfo")
    expect(within(footer).getAllByText(SITE.name).length).toBeGreaterThan(0)
  })

  it("expone la navegación del sitio", () => {
    render(<SiteFooter />)
    const footer = screen.getByRole("contentinfo")
    expect(within(footer).getByRole("link", { name: "Propiedades" })).toHaveAttribute(
      "href",
      "/propiedades",
    )
    expect(within(footer).getByRole("link", { name: "Contacto" })).toHaveAttribute(
      "href",
      "/contacto",
    )
  })

  it("muestra el NAP: dirección, teléfono y email enlazados", () => {
    render(<SiteFooter />)
    expect(screen.getByText(SITE.contact.address)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: SITE.contact.phone })).toHaveAttribute(
      "href",
      SITE.contact.phoneHref,
    )
    expect(screen.getByRole("link", { name: SITE.contact.email })).toHaveAttribute(
      "href",
      `mailto:${SITE.contact.email}`,
    )
  })

  it("enlaza WhatsApp a wa.me con el número de la inmobiliaria", () => {
    render(<SiteFooter />)
    const wa = screen.getByRole("link", { name: /whatsapp/i })
    expect(wa).toHaveAttribute("href", expect.stringContaining(`wa.me/${SITE.contact.whatsapp}`))
  })

  it("enlaza redes y reseñas de Google con etiquetas accesibles", () => {
    render(<SiteFooter />)
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "href",
      SITE.socials.instagram,
    )
    expect(screen.getByRole("link", { name: /facebook/i })).toHaveAttribute(
      "href",
      SITE.socials.facebook,
    )
    expect(screen.getByRole("link", { name: /google/i })).toBeInTheDocument()
  })

  it("incluye el aviso de copyright", () => {
    render(<SiteFooter />)
    expect(screen.getByText(/©/)).toBeInTheDocument()
  })
})
