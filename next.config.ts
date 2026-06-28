import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Fija la raíz del workspace al proyecto: evita que Turbopack infiera mal el root
  // por lockfiles fuera del repo (p. ej. uno suelto en el HOME).
  turbopack: { root: import.meta.dirname },
  images: {
    // Sanity es la única fuente de imágenes remotas (ver specs/DESIGN.md §9).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Reverse proxy de PostHog (specs/ANALYTICS.md §2): el browser pega a nuestro
  // dominio (`/ingest/*`) y Next reescribe hacia PostHog server-side. Así los
  // adblockers no matchean `posthog.com` y no tiran la captura. Cero infra extra.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
      { source: "/ingest/decide", destination: "https://us.i.posthog.com/decide" },
    ]
  },
  // PostHog usa rutas con y sin trailing slash; no las redirijas o se rompe el proxy.
  skipTrailingSlashRedirect: true,
}

export default nextConfig
