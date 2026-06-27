import { HomeIcon } from "@sanity/icons"
import { defineArrayMember, defineField, defineType } from "sanity"
import { isUniqueSlug } from "../lib/isUniqueSlug"

/** Documento principal: la unidad inmobiliaria publicada. */
export const property = defineType({
  name: "property",
  title: "Propiedad",
  type: "document",
  icon: HomeIcon,
  fieldsets: [{ name: "characteristics", title: "Características", options: { columns: 2 } }],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96, isUnique: isUniqueSlug },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "code",
      title: "Código interno",
      type: "string",
    }),
    defineField({
      name: "propertyType",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Casa", value: "house" },
          { title: "Departamento", value: "apartment" },
          { title: "PH", value: "ph" },
          { title: "Terreno", value: "land" },
          { title: "Local", value: "commercial" },
          { title: "Oficina", value: "office" },
          { title: "Galpón", value: "warehouse" },
          { title: "Cochera", value: "garage" },
          { title: "Campo", value: "farm" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "operations",
      title: "Operaciones",
      type: "array",
      of: [defineArrayMember({ type: "operation" })],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((operations) => {
            const types = (operations ?? []).map((op) => (op as { type?: string })?.type)
            const hasDuplicate = types.some((type, index) => type && types.indexOf(type) !== index)
            return hasDuplicate ? "Cada tipo de operación puede aparecer una sola vez" : true
          }),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "location",
      title: "Ubicación",
      type: "location",
    }),
    defineField({
      name: "bedrooms",
      title: "Dormitorios",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "bathrooms",
      title: "Baños",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "rooms",
      title: "Ambientes",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "coveredArea",
      title: "Sup. cubierta (m²)",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "totalArea",
      title: "Sup. total (m²)",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "parkingSpaces",
      title: "Cocheras",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "age",
      title: "Antigüedad (años)",
      type: "number",
      fieldset: "characteristics",
    }),
    defineField({
      name: "condition",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "A estrenar", value: "brandNew" },
          { title: "Usado", value: "used" },
          { title: "En pozo", value: "preConstruction" },
        ],
      },
    }),
    defineField({
      name: "maintenanceFee",
      title: "Expensas",
      type: "price",
    }),
    defineField({
      name: "amenities",
      title: "Amenities",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Pileta", value: "pool" },
          { title: "Parrilla", value: "grill" },
          { title: "SUM", value: "communityRoom" },
          { title: "Gimnasio", value: "gym" },
          { title: "Seguridad 24h", value: "security24h" },
          { title: "Laundry", value: "laundry" },
          { title: "Solárium", value: "solarium" },
          { title: "Cochera de visitas", value: "visitorParking" },
        ],
      },
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Galería",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "status",
      title: "Estado de publicación",
      type: "string",
      options: {
        list: [
          { title: "Disponible", value: "available" },
          { title: "Reservada", value: "reserved" },
          { title: "Vendida", value: "sold" },
          { title: "Alquilada", value: "rented" },
        ],
      },
      initialValue: "available",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Destacada",
      type: "boolean",
      description: "Pin editorial: aparece resaltada en la home.",
      initialValue: false,
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "title", media: "mainImage", status: "status" },
    prepare({ title, media, status }) {
      const labels: Record<string, string> = {
        available: "Disponible",
        reserved: "Reservada",
        sold: "Vendida",
        rented: "Alquilada",
      }
      return {
        title,
        subtitle: status ? labels[status] : undefined,
        media,
      }
    },
  },
})
