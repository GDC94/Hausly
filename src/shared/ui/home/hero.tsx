/**
 * Hero de la home (specs/LAYOUT.md §3). Shell de presentación: titular + subcopy
 * + slot `children` donde la página inyecta la barra de búsqueda (composición
 * cross-feature → vive en `app/`, no acá). Sin asset de imagen todavía: fondo
 * tonal `bg-ink` + glow `accent` vía token (`var(--accent)`, design-tokens-only,
 * AGENTS.md). Cuando haya foto de marca se reemplaza por `<Image fill>` + overlay.
 */
export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-background">
      {/* Glow decorativo — sin semántica. Color/opacity desde el token accent. */}
      <div
        aria-hidden
        className="-z-10 absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)]"
      />
      <div className="mx-auto max-w-(--container-max) px-(--container-padding) py-20 lg:py-28">
        <div className="max-w-2xl">
          <h1 className="text-display">Encontrá tu próxima propiedad</h1>
          <p className="mt-4 max-w-prose text-body text-background/80">
            Casas, departamentos y más en venta y alquiler en las mejores zonas. Empezá tu búsqueda
            acá.
          </p>
        </div>
        <div className="mt-8 max-w-2xl">{children}</div>
      </div>
    </section>
  )
}
