"use client"

import Image from "next/image"
import { Dialog } from "radix-ui"
import { useCallback, useState } from "react"
import { CloseIcon } from "@/shared/ui/icons"

export type GalleryImage = { url: string; alt: string; lqip: string | null }

/**
 * Hero photo-grid + lightbox (patrón Airbnb, specs/LAYOUT.md §7). Client island:
 * el grid y el visor necesitan estado, pero la **primera imagen lleva `priority`**
 * para no perder el LCP. El lightbox usa Radix Dialog → foco atrapado, `Esc`
 * cierra; las flechas ←/→ navegan. NO es carrusel infinito ni autoplay.
 *
 * Las URLs llegan ya resueltas desde el server (cero `urlFor` en el cliente).
 */
export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const show = useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + images.length) % images.length),
    [images.length],
  )

  if (images.length === 0) {
    return <div className="aspect-[16/10] w-full rounded-2xl bg-muted" aria-hidden="true" />
  }

  const [hero, ...rest] = images
  const thumbs = rest.slice(0, 4)

  return (
    <>
      {/* Hero grande + tira de hasta 4 thumbs (variante robusta del photo-grid
          Airbnb, specs/LAYOUT.md §7): `flex-1` reparte los thumbs sin dejar
          celdas huérfanas con pocas fotos. La tira se oculta en mobile — ahí el
          hero + "Ver todas las fotos" alcanzan. */}
      <GridPhoto
        image={hero}
        priority
        onClick={() => show(0)}
        className="aspect-[16/10] w-full sm:aspect-[16/9]"
        sizes="(min-width: 1280px) 80rem, 100vw"
      />
      {thumbs.length > 0 ? (
        <div className="mt-2 hidden gap-2 sm:flex">
          {thumbs.map((image, i) => (
            <GridPhoto
              key={image.url}
              image={image}
              onClick={() => show(i + 1)}
              className="aspect-[4/3] flex-1"
              sizes="25vw"
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => show(0)}
        className="mt-3 inline-flex h-11 items-center rounded-lg border border-border bg-background px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Ver todas las fotos ({images.length})
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm" />
          <Dialog.Content
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1)
              if (e.key === "ArrowLeft") go(-1)
            }}
            className="fixed inset-0 z-50 flex flex-col p-4 focus:outline-none sm:p-6"
          >
            <Dialog.Title className="sr-only">Fotos de {title}</Dialog.Title>
            <div className="flex items-center justify-between text-background">
              <span className="text-body-sm tabular-nums">
                {index + 1} / {images.length}
              </span>
              <Dialog.Close
                aria-label="Cerrar galería"
                className="inline-flex size-11 items-center justify-center rounded-full text-background transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
              >
                <CloseIcon className="size-5" />
              </Dialog.Close>
            </div>

            <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center">
              {images.length > 1 ? <NavButton side="left" onClick={() => go(-1)} /> : null}
              <div className="relative mx-auto aspect-[3/2] w-full">
                <Image
                  src={images[index].url}
                  alt={images[index].alt}
                  fill
                  sizes="(min-width: 1024px) 64rem, 100vw"
                  className="object-contain"
                  placeholder={images[index].lqip ? "blur" : "empty"}
                  blurDataURL={images[index].lqip ?? undefined}
                />
              </div>
              {images.length > 1 ? <NavButton side="right" onClick={() => go(1)} /> : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function GridPhoto({
  image,
  onClick,
  className,
  sizes,
  priority = false,
}: {
  image: GalleryImage
  onClick: () => void
  className: string
  sizes: string
  priority?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-(--duration) ease-(--ease-out-expo) group-hover:scale-[1.03]"
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip ?? undefined}
        priority={priority}
      />
    </button>
  )
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Foto anterior" : "Foto siguiente"}
      className={`absolute z-10 inline-flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background ${
        side === "left" ? "left-2" : "right-2"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          d={side === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
