"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { getDistinctId, hasConsent } from "@/shared/analytics"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { type LeadFormState, submitLead } from "../actions/submit-lead"
import { type LeadInput, leadSchema } from "../schemas/lead-schema"

type LeadFormProps = {
  /** `_id` de la propiedad consultada → la consulta queda vinculada (consulta puntual). */
  propertyId?: string
  /** Mensaje pre-cargado (ej. desde el detalle, "Me interesa esta propiedad…"). */
  defaultMessage?: string
}

const fieldClass =
  "h-9 rounded-md border bg-background px-3 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive"

/**
 * Formulario de consulta (specs/ARCHITECTURE.md §3, specs/LAYOUT.md §8). Valida en
 * cliente con React Hook Form + el MISMO `leadSchema` (zodResolver); al enviar
 * llama al Server Action `submitLead`, que re-valida y persiste. La UX nunca
 * confía sólo en el cliente — el servidor es la autoridad.
 */
export function LeadForm({ propertyId, defaultMessage }: LeadFormProps) {
  const [serverState, setServerState] = useState<LeadFormState | null>(null)
  const [pending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: defaultMessage ?? "",
      propertyId,
      source: "form",
    } satisfies LeadInput,
  })

  function onSubmit(values: LeadInput) {
    // Propaga el `distinct_id` + el consentimiento al Server Action: linkea el
    // `lead_submitted` server-side al recorrido (§5) y respeta el opt-in (§6). Sin
    // consent, el server no manda nada a PostHog (el lead igual se guarda en Sanity).
    const distinctId = getDistinctId()
    const consented = hasConsent()
    startTransition(async () => {
      const result = await submitLead(values, distinctId, consented)
      setServerState(result)
      if (result.status === "success") {
        reset({ name: "", email: "", phone: "", message: "", propertyId, source: "form" })
      }
    })
  }

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("propertyId")} />

      <Field id="lead-name" label="Nombre" error={errors.name?.message}>
        <input
          id="lead-name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className={fieldClass}
          {...register("name")}
        />
      </Field>

      <Field id="lead-email" label="Email" error={errors.email?.message}>
        <input
          id="lead-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={fieldClass}
          {...register("email")}
        />
      </Field>

      <Field id="lead-phone" label="Teléfono" error={errors.phone?.message}>
        <input
          id="lead-phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          className={fieldClass}
          {...register("phone")}
        />
      </Field>

      <Field id="lead-message" label="Mensaje" error={errors.message?.message}>
        <textarea
          id="lead-message"
          rows={4}
          aria-invalid={Boolean(errors.message)}
          className={cn(fieldClass, "h-auto py-2 leading-relaxed")}
          {...register("message")}
        />
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

/** Campo etiquetado con mensaje de error accesible (a11y, specs/SEO.md §6). */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
