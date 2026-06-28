"use client"

import { useEffect, useState } from "react"
import { denyConsent, grantConsent, hasDecidedConsent } from "@/shared/analytics/consent"
import { Button } from "@/shared/ui/button"

/**
 * Banner de consentimiento de cookies (specs/ANALYTICS.md §6). Chrome global del
 * shell `(site)` (specs/LAYOUT.md §2). Requisitos DUROS del proyecto:
 *
 * - **Sin CLS**: posición `fixed` (fuera del flujo) → nunca empuja contenido. No
 *   reserva espacio ni dispara layout shift. Renderiza `null` en SSR y en el primer
 *   paint; recién tras montar decide si mostrarse (evita mismatch de hidratación).
 * - **100% accesible**: `role="dialog"` con label, botones nativos focuseables por
 *   teclado, foco visible (ring de `Button`), contraste AA vía tokens de diseño.
 *
 * Aceptar → `opt_in_capturing()` (habilita el funnel). Rechazar/ignorar → opt-out.
 * El estado persiste (cookie/localStorage) → el banner no reaparece tras decidir.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasDecidedConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  function accept() {
    grantConsent()
    setVisible(false)
  }

  function reject() {
    denyConsent()
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      aria-describedby="consent-banner-text"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg sm:flex sm:items-center sm:gap-4 sm:p-5"
    >
      <p id="consent-banner-text" className="text-body-sm text-muted-foreground">
        Usamos cookies para entender cómo se usa el sitio y mejorarlo. La medición no guarda datos
        personales.
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <Button type="button" variant="outline" size="sm" onClick={reject}>
          Rechazar
        </Button>
        <Button type="button" size="sm" onClick={accept}>
          Aceptar
        </Button>
      </div>
    </div>
  )
}
