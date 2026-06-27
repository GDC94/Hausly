import Link from "next/link"

import { SITE } from "@/shared/config/site"
import { Button } from "@/shared/ui/button"
import { HeaderNav } from "./header-nav"

/**
 * Chrome del sitio: header sticky presente en todas las páginas públicas
 * (shell `(site)`). Server component; la interactividad (ruta activa + menú
 * mobile) vive en el island `HeaderNav`. Ver specs/LAYOUT.md §2.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-border border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-(--container-max) items-center justify-between gap-4 px-(--container-padding)">
        <Link
          href="/"
          className="rounded-md text-subheading font-semibold tracking-tight text-foreground"
        >
          {SITE.name}
        </Link>

        <div className="flex items-center gap-2">
          <HeaderNav />
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href={SITE.cta.href}>{SITE.cta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
