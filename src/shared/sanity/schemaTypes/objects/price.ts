import { defineField, defineType } from "sanity"

/** Monto + moneda. Sin conversión dinámica (Non-Goal). Reusado por operation y maintenanceFee. */
export const price = defineType({
  name: "price",
  title: "Precio",
  type: "object",
  fields: [
    defineField({
      name: "amount",
      title: "Monto",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      options: {
        list: [
          { title: "USD", value: "USD" },
          { title: "ARS", value: "ARS" },
        ],
        layout: "radio",
      },
      // El mercado AR de venta es mayormente USD (default), pero editable: el pozo
      // suele pactarse en ARS indexado (ver SANITY-SCHEMA §5).
      initialValue: "USD",
      validation: (rule) => rule.required(),
    }),
  ],
})
