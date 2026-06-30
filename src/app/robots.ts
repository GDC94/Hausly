import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/shared/config/site"

// Bots de IA generativa (specs/SEO.md §8 GEO): permitirlos explícitamente es
// requisito para que ChatGPT/Perplexity/Gemini/Claude puedan CITAR el sitio.
// Bloquearlos = no hay cita. Acá se listan para dejar la intención explícita
// (igual entran por la regla `*`, pero esto la documenta y la protege).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
]

// robots nativo de Next (specs/SEO.md §5). Permite todo el sitio público; bloquea
// el Studio de Sanity y las rutas de API (no son contenido indexable). El
// `noindex` de los listados filtrados por querystring se resuelve por metadata
// en cada ruta (§2), no acá. Apunta al sitemap.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  const disallow = ["/studio", "/styleguide", "/api/"]

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
