"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { getDistinctId, hasConsent } from "@/shared/analytics"
import { type LeadFormState, submitLead } from "../actions/submit-lead"
import { type LeadInput, leadSchema } from "../schemas/lead-schema"
import { LeadFormView } from "./lead-form-view"

type LeadFormProps = {
  /** `_id` de la propiedad consultada → la consulta queda vinculada (consulta puntual). */
  propertyId?: string
  /** Mensaje pre-cargado (ej. desde el detalle, "Me interesa esta propiedad…"). */
  defaultMessage?: string
}

/**
 * Formulario de consulta (specs/ARCHITECTURE.md §3, specs/LAYOUT.md §8). **Container**:
 * concentra la lógica —valida en cliente con React Hook Form + el MISMO `leadSchema`
 * (zodResolver); al enviar llama al Server Action `submitLead`, que re-valida y
 * persiste; propaga analytics— y delega TODO el render a `LeadFormView` (presentational
 * puro). La UX nunca confía sólo en el cliente — el servidor es la autoridad. El split
 * container/presentational permite a la vitrina `/styleguide` exhibir los estados del
 * form sin disparar la acción (specs/STYLEGUIDE.md §5).
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

  return (
    <LeadFormView
      register={register}
      errors={errors}
      pending={pending}
      serverState={serverState}
      onSubmit={handleSubmit(onSubmit)}
    />
  )
}
