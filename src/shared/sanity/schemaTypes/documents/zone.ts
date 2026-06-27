import { PinIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"
import { isUniqueSlug } from "../lib/isUniqueSlug"

/** Taxonomía geográfica (barrio/localidad) usada para filtrar y para landings SEO. */
export const zone = defineType({
  name: "zone",
  title: "Zona",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96, isUnique: isUniqueSlug },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      title: "Localidad",
      type: "string",
    }),
    defineField({
      name: "province",
      title: "Provincia",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "city" },
  },
})
