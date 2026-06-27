import { EnvelopeIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

/** Consulta de un interesado. Registro durable (se persiste antes de notificar). */
export const lead = defineType({
  name: "lead",
  title: "Consulta",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Teléfono",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "message",
      title: "Mensaje",
      type: "text",
    }),
    defineField({
      name: "property",
      title: "Propiedad",
      type: "reference",
      to: [{ type: "property" }],
      description: "Vacío = consulta general (no por una propiedad puntual).",
    }),
    defineField({
      name: "source",
      title: "Origen",
      type: "string",
      options: {
        list: [
          { title: "Formulario", value: "form" },
          { title: "WhatsApp", value: "whatsapp" },
        ],
      },
      initialValue: "form",
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "Nueva", value: "new" },
          { title: "Contactada", value: "contacted" },
          { title: "Cerrada", value: "closed" },
        ],
      },
      initialValue: "new",
    }),
  ],
  // Una consulta sin forma de contactar no sirve: exigimos teléfono o email.
  validation: (rule) =>
    rule.custom((doc) => {
      const lead = doc as { phone?: string; email?: string } | undefined
      if (lead?.phone || lead?.email) return true
      return "Una consulta necesita al menos un teléfono o un email"
    }),
  preview: {
    select: { title: "name", status: "status", phone: "phone", email: "email" },
    prepare({ title, status, phone, email }) {
      const labels: Record<string, string> = {
        new: "Nueva",
        contacted: "Contactada",
        closed: "Cerrada",
      }
      return {
        title: title ?? "Consulta",
        subtitle: [status ? labels[status] : null, phone ?? email].filter(Boolean).join(" · "),
      }
    },
  },
})
