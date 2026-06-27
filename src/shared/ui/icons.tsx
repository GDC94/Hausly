import type { SVGProps } from "react"

/**
 * Íconos como SVG inline (sin dependencia de bundle).
 * Decorativos: `aria-hidden` literal en el `<svg>` (vía `IconBase`). La etiqueta
 * accesible va en el contenedor (link/botón) con texto visible o `aria-label`.
 */
type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props}>
      {children}
    </svg>
  )
}

/** Hamburguesa (abrir menú mobile). */
export function MenuIcon(props: IconProps) {
  return (
    <IconBase fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </IconBase>
  )
}

/** Cruz (cerrar menú mobile). */
export function CloseIcon(props: IconProps) {
  return (
    <IconBase fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  )
}

/** Estrella (reseñas Google). */
export function StarIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" {...props}>
      <path d="m12 17.27 5.18 3.12-1.37-5.9 4.58-3.97-6.04-.52L12 4.5 9.65 9.99l-6.04.52 4.58 3.97-1.37 5.9z" />
    </IconBase>
  )
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16-.35.22-.64.07-1.26-.46-2.39-1.47c-.89-.79-1.48-1.76-1.65-2.06s-.02-.46.13-.6c.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5s.05-.37-.02-.52-.67-1.61-.92-2.21c-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.87 1.21 3.07 2.1 3.2 5.08 4.49c.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41s.25-1.29.17-1.41-.27-.2-.57-.35M12.05 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26 9.88 9.88 0 0 1 16.88-6.99 9.83 9.83 0 0 1 2.89 6.99 9.88 9.88 0 0 1-9.88 9.89M20.52 3.45A11.8 11.8 0 0 0 12.05 0 11.9 11.9 0 0 0 .1 11.89a11.8 11.8 0 0 0 1.59 5.95L0 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.58 0 11.94-5.36 11.94-11.89a11.8 11.8 0 0 0-3.42-8.43" />
    </IconBase>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88" />
    </IconBase>
  )
}

export function FacebookIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" {...props}>
      <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07" />
    </IconBase>
  )
}
