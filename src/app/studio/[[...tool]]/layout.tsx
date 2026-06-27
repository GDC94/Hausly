import { metadata, viewport } from "next-sanity/studio"
import type { ReactNode } from "react"

// El Studio define su propio metadata/viewport (full-screen, sin zoom).
export { metadata, viewport }

export default function StudioLayout({ children }: { children: ReactNode }) {
  return children
}
