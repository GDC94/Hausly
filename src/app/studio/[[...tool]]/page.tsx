"use client"

import { NextStudio } from "next-sanity/studio"
import config from "../../../../sanity.config"

// Studio embebido. Vive FUERA del route group (site) → no hereda header/footer,
// solo el root layout pelado (ver specs/ARCHITECTURE §7).
export default function StudioPage() {
  return <NextStudio config={config} />
}
