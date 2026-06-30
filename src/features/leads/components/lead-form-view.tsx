import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Button } from "@/shared/ui/button"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import type { LeadFormState } from "../actions/submit-lead"
import type { LeadFormValues } from "../schemas/lead-schema"

type LeadFormViewProps = {
  /** Binder de campos de React Hook Form, inyectado por el container. */
  register: UseFormRegister<LeadFormValues>
  /** Errores de validación cliente por campo (RHF). */
  errors: FieldErrors<LeadFormValues>
  /** Envío en curso → deshabilita el submit y anuncia el progreso. */
  pending: boolean
  /** Resultado del Server Action: `success` pinta el panel de éxito; `error`, el mensaje server. */
  serverState: LeadFormState | null
  /** Handler de submit (en el container es `handleSubmit(onSubmit)`). */
  onSubmit: React.FormEventHandler<HTMLFormElement>
  /**
   * Prefijo opcional para los `id` de los campos. Default `""` → ids estables
   * (`lead-name`…) para el caso normal de un form por página. Permite montar VARIOS
   * forms en una misma página sin colisión de ids (ej. la vitrina con los 3 estados,
   * o contacto + newsletter en una landing) — la asociación label↔control sigue intacta.
   */
  idPrefix?: string
}

/**
 * Vista presentacional pura del formulario de consulta (specs/STYLEGUIDE.md §5 nota
 * `forms`). NO tiene lógica: no llama al Server Action, no usa `useForm` ni analytics —
 * todo eso vive en el container `LeadForm`. Decide markup según el estado que recibe
 * (form en idle/error vs panel de éxito), por lo que la vitrina `/styleguide` puede
 * exhibir los 3 estados sin disparar `submitLead` (que crearía leads reales en Sanity).
 */
export function LeadFormView({
  register,
  errors,
  pending,
  serverState,
  onSubmit,
  idPrefix = "",
}: LeadFormViewProps) {
  if (serverState?.status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-success/40 bg-success/5 px-4 py-6 text-center"
      >
        <p className="text-body text-foreground">{serverState.message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("propertyId")} />

      <Field id={`${idPrefix}lead-name`} label="Nombre" error={errors.name?.message}>
        <Input type="text" autoComplete="name" {...register("name")} />
      </Field>

      <Field id={`${idPrefix}lead-email`} label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>

      <Field id={`${idPrefix}lead-phone`} label="Teléfono" error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...register("phone")} />
      </Field>

      <Field id={`${idPrefix}lead-message`} label="Mensaje" error={errors.message?.message}>
        <Textarea rows={4} {...register("message")} />
      </Field>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar consulta"}
      </Button>

      {serverState?.status === "error" ? (
        <p role="alert" className="text-body-sm text-destructive">
          {serverState.message}
        </p>
      ) : null}

      <p className="text-caption text-muted-foreground">
        Dejá un email o un teléfono y te contactamos a la brevedad.
      </p>
    </form>
  )
}
