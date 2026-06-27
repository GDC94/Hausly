"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { SITE } from "@/shared/config/site"
import { isActivePath } from "@/shared/lib/is-active-path"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { CloseIcon, MenuIcon } from "@/shared/ui/icons"

/**
 * Navegación del header: enlaces inline en desktop + menú disclosure accesible
 * en mobile. Client island porque resalta la ruta activa (`usePathname`) y
 * maneja el estado abierto/cerrado del panel.
 */
export function HeaderNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    toggleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, close])

  return (
    <>
      {/* Desktop */}
      <nav aria-label="Navegación principal" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {SITE.nav.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} pathname={pathname}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: botón disclosure */}
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-md text-foreground md:hidden hover:bg-secondary"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>

      {open && <MobilePanel id={panelId} pathname={pathname} onClose={close} />}
    </>
  )
}

function MobilePanel({
  id,
  pathname,
  onClose,
}: {
  id: string
  pathname: string
  onClose: () => void
}) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    firstLinkRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] md:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar menú"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="absolute inset-x-0 top-0 bg-background p-4 shadow-lg"
      >
        <nav aria-label="Navegación principal (mobile)">
          <ul className="flex flex-col gap-1">
            {SITE.nav.map((item, i) => (
              <li key={item.href}>
                <NavLink
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  pathname={pathname}
                  onClick={onClose}
                  className="block py-3 text-body"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Button asChild className="mt-2 w-full">
          <Link href={SITE.cta.href} onClick={onClose}>
            {SITE.cta.label}
          </Link>
        </Button>
      </div>
    </div>
  )
}

function NavLink({
  href,
  pathname,
  children,
  className,
  ref,
  onClick,
}: {
  href: string
  pathname: string
  children: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLAnchorElement>
  onClick?: () => void
}) {
  const active = isActivePath(pathname, href)
  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2 text-body-sm text-slate transition-colors hover:text-foreground",
        active && "font-medium text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  )
}
