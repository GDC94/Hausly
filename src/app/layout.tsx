import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "Hausly",
  description: "Inmobiliaria",
}

// ROOT layout: <html>/<body>, fonts y providers globales. Mínimo, sin chrome.
// El header/footer viven en app/(site)/layout.tsx (ver specs/ARCHITECTURE.md §7).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  )
}
