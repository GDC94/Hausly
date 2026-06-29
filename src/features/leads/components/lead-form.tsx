"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { getDistinctId, hasConsent } from "@/shared/analytics"
import { Button } from "@/shared/ui/button"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { type LeadFormState, submitLead } from "../actions/submit-lead"
import { type LeadInput, leadSchema } from "../schemas/lead-schema"

type LeadFormProps = {
  /** `_id` de la propiedad consultada → la consulta queda vinculada (consulta puntual). */
  propertyId?: string
  /** Mensaje pre-cargado (ej. desde el detalle, "Me interesa esta propiedad…"). */
  defaultMessage?: string
}

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
        <Input type="text" autoComplete="name" {...register("name")} />
      </Field>

      <Field id="lead-email" label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>

      <Field id="lead-phone" label="Teléfono" error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...register("phone")} />
      </Field>

      <Field id="lead-message" label="Mensaje" error={errors.message?.message}>
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
