"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Sparkles } from "lucide-react"

interface HeroBannerProps {
  title: React.ReactNode // Cambiado a ReactNode para aceptar el salto de línea <br /> sin errores
  subtitle?: string
  photoCount: number
  coverImage?: string
}

export function HeroBanner({ title, subtitle, photoCount, coverImage }: HeroBannerProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <header className="relative h-[30vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-background">
      {/* Background Image */}
      {coverImage && (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt="Portada del álbum"
            fill
            priority
            sizes="100vw"
            /* ¡LA MAGIA! 
               En móviles usa 'object-contain' para que la foto se reduzca proporcionalmente sin cortarse los bordes.
               En pantallas medianas/grandes (md:) vuelve a acoplarse con 'object-cover'.
            */
            className={`transition-opacity duration-700 object-contain md:object-cover object-center ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Gradient Overlays ajustados para que no tapen de negro la imagen en tonos rosa */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-transparent to-background/10" />
        </div>
      )}

      {/* Fallback gradient if no cover image */}
      {!coverImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center z-10">
        {/* Decorative Element */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-px w-12 bg-white/60" />
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <div className="h-px w-12 bg-white/60" />
        </div>

        {/* Title (En vuelto en un contenedor con sombreado de texto para que resalte sobre el fondo claro) */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 text-balance drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-6 sm:mb-8 text-pretty drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-light">
            {subtitle}
          </p>
        )}

        {/* Photo Count Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-md">
          <Camera className="w-4 h-4" />
          <span>{photoCount} Fotos</span>
        </div>
      </div>

      {/* ¡ELIMINADO POR COMPLETO EL BLOQUE DEL SCROLL INDICATOR (RATÓN)! 
          Ya no volverá a aparecer flotando ni subiendo/bajando sobre tus botones.
      */}
    </header>
  )
}
