import { z } from "zod"

/**
 * Schema ÚNICO de una consulta (lead), consumido por el cliente (React Hook Form)
 * y el servidor (Server Action) — specs/ARCHITECTURE.md §3: "Zod en los bordes,
 * nunca confiar en el cliente". Espeja la forma del doc `lead` de Sanity
 * (specs/SANITY-SCHEMA.md): incluida la invariante "una consulta necesita al menos
 * un teléfono o un email".
 *
 * `email`/`phone`/`message` admiten string vacío y lo tratan como ausente: los
 * inputs no controlados del form emiten `""`, no `undefined`, así que normalizar
 * acá evita validar un email vacío como email roto.
 */
export const leadSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresá tu nombre").max(120),
    // Trim ANTES de validar: un email pegado con espacios alrededor es válido una
    // vez normalizado. Sin esto, `z.email()` lo rechaza (la validación nativa del
    // form está desactivada y el servidor reusa el mismo schema).
    email: z
      .preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        z.union([z.literal(""), z.email("Revisá el email")]),
      )
      .optional(),
    phone: z.string().trim().max(40).optional(),
    message: z.string().trim().max(2000).optional(),
    /** `_id` de la propiedad consultada; ausente = consulta general. */
    propertyId: z.string().optional(),
    source: z.enum(["form", "whatsapp"]).default("form"),
  })
  .refine((lead) => Boolean(lead.email?.trim() || lead.phone?.trim()), {
    message: "Dejá un email o un teléfono para poder contactarte",
    path: ["email"],
  })

/** Input validado de una consulta — el contrato que cruza cliente → servidor → core. */
export type LeadInput = z.infer<typeof leadSchema>

/**
 * Forma de ENTRADA del schema (lo que React Hook Form maneja antes de validar): el
 * `preprocess` del email lo deja como `unknown`, `source` es opcional por el `default`.
 * Es el tipo de `TFieldValues` que infiere `useForm` → lo consume `LeadFormView` para
 * que `register`/`errors` casen con el container (specs/STYLEGUIDE.md §5).
 */
export type LeadFormValues = z.input<typeof leadSchema>
