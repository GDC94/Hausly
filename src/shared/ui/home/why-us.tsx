import { cn } from "@/shared/lib/utils"

/**
 * Bento "por qué nosotros" en clave AGENCIA (specs/LAYOUT.md §3): stats + value
 * props, sin foto ni persona. `zonesCount` se deriva del dato real (zonas
 * cubiertas); el resto son cifras de agencia placeholder hasta cablear el
 * singleton `agency` (ver shared/config/site).
 */
export function WhyUs({ zonesCount }: { zonesCount: number }) {
  const stats = [
    { value: "15", label: "años acompañando operaciones" },
    { value: "90+", label: "propiedades vendidas" },
    { value: zonesCount > 0 ? String(zonesCount) : "—", label: "zonas cubiertas" },
  ]

  const values = [
    {
      title: "Asesoramiento real",
      body: "Te guiamos en cada paso: tasación, visitas y cierre. Sin vueltas.",
    },
    {
      title: "Conocemos el barrio",
      body: "Operamos donde vivís: precios de mercado y oportunidades reales.",
    },
  ]

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-(--container-max) px-(--container-padding) py-16 lg:py-20">
        <h2 className="text-heading text-foreground">Por qué elegirnos</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-display text-foreground">{stat.value}</p>
              <p className="mt-1 text-body-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
          {values.map((value, index) => (
            <div
              key={value.title}
              // La primera value card ocupa 2 columnas en `lg` para completar la
              // segunda fila (3 col): span por índice del map, NO `:first-of-type`
              // (evaluaría entre TODOS los div hermanos → la primera stat card).
              className={cn(
                "rounded-2xl border border-border bg-card p-6 shadow-sm sm:col-span-2",
                index === 0 ? "lg:col-span-2" : "lg:col-span-1",
              )}
            >
              <h3 className="text-subheading font-semibold text-foreground">{value.title}</h3>
              <p className="mt-2 text-body-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
