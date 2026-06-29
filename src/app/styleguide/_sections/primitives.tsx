import type { ReactNode } from "react"
import { Button } from "@/shared/ui/button"
import { Field } from "@/shared/ui/field"
import {
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  MenuIcon,
  StarIcon,
  WhatsAppIcon,
} from "@/shared/ui/icons"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"
import { Specimen } from "../_components/specimen"

const BUTTON_VARIANTS = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const TEXT_SIZES = ["xs", "sm", "default", "lg"] as const
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const
const FIELD_SIZES = ["xs", "sm", "default", "lg"] as const
const ICONS = [
  { label: "Menu", Icon: MenuIcon },
  { label: "Close", Icon: CloseIcon },
  { label: "Star", Icon: StarIcon },
  { label: "WhatsApp", Icon: WhatsAppIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
] as const

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-body font-semibold text-foreground">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/**
 * Sección `primitives` (specs/STYLEGUIDE.md §5): átomos de `shared/ui`. Es data-less
 * —no toca Sanity— así que exhibe directo: Button (6 variantes × 4 sizes de texto + 4
 * de ícono), Input/Select/Textarea (4 sizes + error + disabled), Label (2 tones), Field
 * (con/sin error) y la grilla de 6 íconos.
 */
export function PrimitivesSection() {
  return (
    <div className="flex flex-col gap-10">
      <Group title="Button — variantes × sizes de texto">
        {BUTTON_VARIANTS.map((variant) => (
          <Specimen key={variant} label={`Button · ${variant} · xs / sm / default / lg`}>
            <div className="flex flex-wrap items-center gap-3">
              {TEXT_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          </Specimen>
        ))}
        <Specimen label="Button · default · sizes de ícono (icon-xs / icon-sm / icon / icon-lg)">
          <div className="flex flex-wrap items-center gap-3">
            {ICON_SIZES.map((size) => (
              <Button key={size} size={size} aria-label={`Favorito ${size}`}>
                <StarIcon />
              </Button>
            ))}
          </div>
        </Specimen>
      </Group>

      <Group title="Input">
        <Specimen label="Input · xs / sm / default / lg">
          <div className="flex flex-col gap-3">
            {FIELD_SIZES.map((size) => (
              <Input key={size} size={size} placeholder={`Input ${size}`} />
            ))}
          </div>
        </Specimen>
        <Specimen label="Input · error (aria-invalid) · disabled">
          <div className="flex flex-col gap-3">
            <Input aria-invalid defaultValue="valor inválido" />
            <Input disabled placeholder="deshabilitado" />
          </div>
        </Specimen>
      </Group>

      <Group title="Select">
        <Specimen label="Select · xs / sm / default / lg">
          <div className="flex flex-col gap-3">
            {FIELD_SIZES.map((size) => (
              <Select key={size} size={size} defaultValue="">
                <option value="" disabled>
                  Elegí una opción
                </option>
                <option value="sale">Venta</option>
                <option value="rent">Alquiler</option>
              </Select>
            ))}
          </div>
        </Specimen>
        <Specimen label="Select · error (aria-invalid) · disabled">
          <div className="flex flex-col gap-3">
            <Select aria-invalid defaultValue="sale">
              <option value="sale">Venta</option>
            </Select>
            <Select disabled defaultValue="sale">
              <option value="sale">Venta</option>
            </Select>
          </div>
        </Specimen>
      </Group>

      <Group title="Textarea">
        <Specimen label="Textarea · default · error (aria-invalid) · disabled">
          <div className="flex flex-col gap-3">
            <Textarea rows={3} placeholder="Mensaje…" />
            <Textarea rows={3} aria-invalid defaultValue="contenido inválido" />
            <Textarea rows={3} disabled placeholder="deshabilitado" />
          </div>
        </Specimen>
      </Group>

      <Group title="Label">
        <Specimen label="Label · default / muted">
          <div className="flex flex-col gap-2">
            <Label>Label default</Label>
            <Label tone="muted">Label muted</Label>
          </div>
        </Specimen>
      </Group>

      <Group title="Field">
        <Specimen label="Field · sin error / con error">
          <div className="flex flex-col gap-4">
            <Field id="sg-field-ok" label="Email">
              <Input type="email" placeholder="vos@mail.com" />
            </Field>
            <Field id="sg-field-error" label="Email" error="Revisá el email">
              <Input type="email" defaultValue="no-es-email" />
            </Field>
          </div>
        </Specimen>
      </Group>

      <Group title="Icons">
        <Specimen label="Iconos · grilla de 6">
          <div className="flex flex-wrap gap-6">
            {ICONS.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="size-6 text-foreground" />
                <span className="text-caption text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </Specimen>
      </Group>
    </div>
  )
}
