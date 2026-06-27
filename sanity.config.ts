import { visionTool } from "@sanity/vision"
import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
// Imports relativos a propósito: el CLI de Sanity (schema extract / typegen) no
// resuelve el alias "@/*" del tsconfig.
import { getSanityEnv } from "./src/shared/sanity/env"
import { schemaTypes } from "./src/shared/sanity/schemaTypes"
import { structure } from "./src/shared/sanity/structure"

const { projectId, dataset } = getSanityEnv()

export default defineConfig({
  name: "default",
  title: "Hausly",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
  document: {
    // Singleton agency: no se puede crear/duplicar/borrar; se edita el único doc.
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== "agency"),
    actions: (prev, { schemaType }) =>
      schemaType === "agency"
        ? prev.filter(
            ({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish",
          )
        : prev,
  },
})
