import { defineField, defineType } from "sanity"

/** Dónde está la propiedad: zona (reference, para filtros) + dirección + geo. */
export const location = defineType({
  name: "location",
  title: "Ubicación",
  type: "object",
  fields: [
    defineField({
      name: "zone",
      title: "Zona",
      type: "reference",
      to: [{ type: "zone" }],
    }),
    defineField({
      name: "address",
      title: "Dirección",
      type: "string",
    }),
    defineField({
      name: "showAddress",
      title: "Mostrar dirección",
      type: "boolean",
      description: "Si está apagado, la dirección exacta no se publica (privacidad).",
      initialValue: false,
    }),
    defineField({
      name: "geopoint",
      title: "Punto geográfico",
      type: "geopoint",
    }),
  ],
})
