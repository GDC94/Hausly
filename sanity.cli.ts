import { defineCliConfig } from "sanity/cli"

// El CLI carga los .env automáticamente; projectId/dataset salen del env.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  autoUpdates: true,
})
