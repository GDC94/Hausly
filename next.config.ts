import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Fija la raíz del workspace al proyecto: evita que Turbopack infiera mal el root
  // por lockfiles fuera del repo (p. ej. uno suelto en el HOME).
  turbopack: { root: import.meta.dirname },
  images: {
    // Sanity es la única fuente de imágenes remotas (ver specs/DESIGN.md §9).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
}

export default nextConfig
