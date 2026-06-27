import { defineField, defineType } from "sanity"

/** Forma comercial de una propiedad. Una propiedad puede tener varias a la vez. */
export const operation = defineType({
  name: "operation",
  title: "Operación",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Tipo de operación",
      type: "string",
      options: {
        list: [
          { title: "Venta", value: "sale" },
          { title: "Alquiler", value: "rent" },
          { title: "Alquiler temporario", value: "temporaryRent" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "price",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { type: "type", amount: "price.amount", currency: "price.currency" },
    prepare({ type, amount, currency }) {
      const labels: Record<string, string> = {
        sale: "Venta",
        rent: "Alquiler",
        temporaryRent: "Alquiler temporario",
      }
      return {
        title: type ? (labels[type] ?? type) : "Operación",
        subtitle:
          typeof amount === "number"
            ? `${amount.toLocaleString("es-AR")} ${currency ?? ""}`
            : undefined,
      }
    },
  },
})
