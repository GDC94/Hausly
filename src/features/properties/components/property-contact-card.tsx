import { LeadForm } from "@/features/leads"
import { whatsappUrl } from "@/shared/config/site"
import { formatPrice } from "@/shared/lib/format-price"
import { OPERATION_LABELS } from "@/shared/lib/labels"
import { Button } from "@/shared/ui/button"
import { WhatsAppIcon } from "@/shared/ui/icons"
import type { PropertyDetail } from "../types"

/**
 * Card de contacto sticky (patrón Airbnb "booking card", specs/LAYOUT.md §7),
 * pero para **captar lead**. Muestra el precio DUAL (una fila por operación, cada
 * una en su moneda — sin conversión, Non-Goal) + CTAs de consulta y WhatsApp.
 */
export function PropertyContactCard({ property }: { property: PropertyDetail }) {
  const operations = property.operations ?? []
  const fee = property.maintenanceFee

  const message = `Hola Hausly, me interesa "${property.title ?? "esta propiedad"}"${
    property.code ? ` (${property.code})` : ""
  }. ¿Me pasás más información?`

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      {operations.length > 0 ? (
        <ul className="space-y-2">
          {operations.map((op) => (
            <li
              key={`${op.type}-${op.price?.currency}-${op.price?.amount}`}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="text-body-sm text-muted-foreground">
                {op.type ? OPERATION_LABELS[op.type] : "Precio"}
              </span>
              <span className="text-subheading font-semibold text-foreground">
                {formatPrice(op.price?.amount, op.price?.currency ?? "USD")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-subheading font-semibold text-foreground">Consultar precio</p>
      )}

      {fee?.amount ? (
        <p className="mt-2 text-caption text-muted-foreground">
          + Expensas {formatPrice(fee.amount, fee.currency ?? "ARS")}
        </p>
      ) : null}

      {/* Form inline scoped a esta propiedad (issue #11): la consulta queda
          vinculada al `_id`, con el mensaje pre-cargado. Sin navegar fuera del
          detalle. WhatsApp queda como canal alternativo. */}
      <div className="mt-6">
        <h2 className="text-body font-semibold text-foreground">Consultá por esta propiedad</h2>
        <div className="mt-4">
          <LeadForm propertyId={property._id} defaultMessage={message} />
        </div>
      </div>

      <div className="mt-3">
        <Button asChild variant="outline" size="lg" className="h-11 w-full">
          <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}
