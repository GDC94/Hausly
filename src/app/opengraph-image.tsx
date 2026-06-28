import { ImageResponse } from "next/og"
import { SITE_NAME } from "@/shared/config/site"
import { BRAND_COLORS } from "@/shared/design/brand-colors"

// OG image global por defecto (specs/SEO.md §3). Convención nativa de Next
// (`opengraph-image`, next/og, runtime Node) en vez de una ruta `/api/og` en Edge:
// Next la aplica como OG a CUALQUIER ruta que no defina la suya (el detalle de
// propiedad sí arma la suya desde `mainImage`, que la override por ser más
// específica). Es el fallback de marca.
//
// satori (motor de `next/og`) sólo acepta estilos inline y NO resuelve los tokens
// `@theme`: es el único contexto exento de "design tokens only" (AGENTS.md). Los
// colores salen de `BRAND_COLORS` (fuente única TS, espejo de los tokens CSS).
export const alt = `${SITE_NAME} — Inmobiliaria`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BRAND_COLORS.ink,
        color: BRAND_COLORS.surface,
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND_COLORS.accent }} />
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>{SITE_NAME}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          Propiedades en venta y alquiler
        </div>
        <div style={{ fontSize: 36, color: BRAND_COLORS.gray }}>
          Encontrá tu próxima casa o departamento.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: 8,
          width: 160,
          background: BRAND_COLORS.accent,
          borderRadius: 999,
        }}
      />
    </div>,
    { ...size },
  )
}
