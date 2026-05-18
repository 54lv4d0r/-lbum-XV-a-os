"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"

interface Photo {
  id: string
  url: string
  name: string
}

interface MasonryGalleryProps {
  photos: Photo[]
}

export function MasonryGallery({ photos }: MasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      
      if (e.key === "Escape") {
        setSelectedIndex(null)
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null))
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, photos.length])

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [selectedIndex])

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id))
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null))
  }

  const handleDownload = async () => {
    if (selectedIndex === null) return
    const photo = photos[selectedIndex]
    
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = photo.name || `photo-${selectedIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download image:", error)
    }
  }

  // Create varied heights for masonry effect
  const getHeightClass = (index: number) => {
    const heights = [
      "h-48 sm:h-56 md:h-64",
      "h-64 sm:h-72 md:h-80",
      "h-56 sm:h-64 md:h-72",
      "h-72 sm:h-80 md:h-96",
      "h-52 sm:h-60 md:h-68",
    ]
    return heights[index % heights.length]
  }

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl bg-muted"
            onClick={() => openLightbox(index)}
          >
            <div className={`relative ${getHeightClass(index)} w-full`}>
              <div
                className={`absolute inset-0 bg-muted animate-pulse transition-opacity duration-300 ${
                  loadedImages.has(photo.id) ? "opacity-0" : "opacity-100"
                }`}
              />
              <Image
                src={photo.url}
                alt={photo.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                  loadedImages.has(photo.id) ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleImageLoad(photo.id)}
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-card text-sm font-medium truncate">
                  {photo.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-card/10 backdrop-blur-sm text-card hover:bg-card/20 transition-colors"
            aria-label="Cerrar visor"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
            className="absolute top-4 right-20 z-50 p-3 rounded-full bg-card/10 backdrop-blur-sm text-card hover:bg-card/20 transition-colors"
            aria-label="Descargar imagen"
          >
            <Download className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-card/10 backdrop-blur-sm text-card hover:bg-card/20 transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-card/10 backdrop-blur-sm text-card hover:bg-card/20 transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].name}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm text-card text-sm font-medium">
            {selectedIndex + 1} de {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
