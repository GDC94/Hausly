"use client"

import { useEffect } from "react"
import { capture } from "./capture"
import { ANALYTICS_EVENTS } from "./events"

/**
 * Telemetría del CTA de WhatsApp por **delegación de eventos** (specs/ANALYTICS.md
 * §4: `whatsapp_clicked`, soft conversion). Un único listener en el shell `(site)`
 * captura los clicks en cualquier `a[data-wa-source]`.
 *
 * Por qué delegación y no un componente client por link: los 4 CTAs de WhatsApp
 * (detalle, footer, home, contacto) viven en **Server Components**. Envolverlos en
 * islas client por un `onClick` rompería el server-first del proyecto
 * (specs/ARCHITECTURE.md). El `data-wa-source` es sólo el transporte; el gate de
 * consentimiento sigue centralizado en `capture()` (no-op hasta opt-in).
 */
export function WhatsAppTelemetry() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Element | null
      const link = target?.closest("a[data-wa-source]")
      if (!link) return
      capture({
        event: ANALYTICS_EVENTS.whatsappClicked,
        source: link.getAttribute("data-wa-source") ?? "unknown",
      })
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return null
}
