"use client"

import { useForm } from "react-hook-form"
import { type LeadFormValues, LeadFormView } from "@/features/leads"
import { Specimen } from "@/shared/styleguide"

// Island cliente: exhibe los 3 estados del LeadForm vía LeadFormView (la vista pura del
// split #37). RSC no puede pasar handlers (onChange/onBlur de `register`) a inputs host,
// así que esto corre en cliente. Clave: usa LeadFormView, NO el LeadForm real → NUNCA
// dispara el Server Action `submitLead`, así que no crea leads basura en Sanity (la razón
// de ser del split, specs/STYLEGUIDE.md §5). El estado se fuerza por prop (`serverState`).

function useLeadFormBindings() {
  const {
    register,
    formState: { errors },
  } = useForm<LeadFormValues>({
    defaultValues: { name: "", email: "", phone: "", message: "", source: "form" },
  })
  return { register, errors }
}

const noSubmit = (event: React.FormEvent) => event.preventDefault()

/** Los 3 estados del LeadForm, uno por espécimen. */
export function LeadFormStates() {
  const { register, errors } = useLeadFormBindings()
  return (
    <div className="flex flex-col gap-4">
      <Specimen label="LeadForm · idle">
        <LeadFormView
          idPrefix="sg-idle-"
          register={register}
          errors={errors}
          pending={false}
          serverState={null}
          onSubmit={noSubmit}
        />
      </Specimen>
      <Specimen label="LeadForm · error (server)">
        <LeadFormView
          idPrefix="sg-error-"
          register={register}
          errors={errors}
          pending={false}
          serverState={{ status: "error", message: "Revisá los datos del formulario." }}
          onSubmit={noSubmit}
        />
      </Specimen>
      <Specimen label="LeadForm · éxito">
        <LeadFormView
          register={register}
          errors={errors}
          pending={false}
          serverState={{ status: "success", message: "¡Gracias! Te contactamos a la brevedad." }}
          onSubmit={noSubmit}
        />
      </Specimen>
    </div>
  )
}

/** Un único LeadForm en estado idle — para el slot del PropertyContactCard del detalle. */
export function LeadFormIdle() {
  const { register, errors } = useLeadFormBindings()
  return (
    <LeadFormView
      idPrefix="sg-detail-"
      register={register}
      errors={errors}
      pending={false}
      serverState={null}
      onSubmit={noSubmit}
    />
  )
}
