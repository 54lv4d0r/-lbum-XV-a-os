"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Sparkles } from "lucide-react"

interface HeroBannerProps {
  title: string
  subtitle?: string
  photoCount: number
  coverImage?: string
}

export function HeroBanner({ title, subtitle, photoCount, coverImage }: HeroBannerProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <header className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Background Image */}
      {coverImage && (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt="Portada del álbum"
            fill
            priority
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/20 via-transparent to-foreground/20" />
        </div>
      )}

      {/* Fallback gradient if no cover image */}
      {!coverImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Decorative Element */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-card/60" />
          <Sparkles className="w-5 h-5 text-accent" />
          <div className="h-px w-12 bg-card/60" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-card mb-4 text-balance drop-shadow-lg">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-lg md:text-xl text-card/90 max-w-2xl mx-auto mb-8 text-pretty drop-shadow-md">
            {subtitle}
          </p>
        )}

        {/* Photo Count Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/20 backdrop-blur-sm border border-card/20 text-card text-sm font-medium">
          <Camera className="w-4 h-4" />
          <span>{photoCount} Fotos</span>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-card/40 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 bg-card/60 rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  )
}
