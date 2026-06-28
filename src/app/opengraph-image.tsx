import { ImageResponse } from "next/og"
import { SITE_NAME } from "@/shared/config/site"

// OG image global por defecto (specs/SEO.md §3). Convención nativa de Next
// (`opengraph-image`, next/og, runtime Node) en vez de una ruta `/api/og` en Edge:
// Next la aplica como OG a CUALQUIER ruta que no defina la suya (el detalle de
// propiedad sí arma la suya desde `mainImage`). Es el fallback de marca.
//
// Los colores van como literales (no tokens CSS): `ImageResponse` no resuelve
// custom properties — son los valores de `--foreground`/`--accent` de DESIGN.md.
export const alt = `${SITE_NAME} — Inmobiliaria`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const INK = "#151819"
const ACCENT = "#2bb1ff"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: INK,
        color: "#ffffff",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT }} />
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>{SITE_NAME}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          Propiedades en venta y alquiler
        </div>
        <div style={{ fontSize: 36, color: "#8d9499" }}>
          Encontrá tu próxima casa o departamento.
        </div>
      </div>

      <div
        style={{ display: "flex", height: 8, width: 160, background: ACCENT, borderRadius: 999 }}
      />
    </div>,
    { ...size },
  )
}
