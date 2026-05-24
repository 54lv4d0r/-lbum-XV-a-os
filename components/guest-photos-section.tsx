"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera, X, ChevronLeft, ChevronRight, Download } from "lucide-react"

interface GuestPhoto {
  name: string
  url: string
  guestName: string
  createdAt: Date
}

interface GuestPhotosSectionProps {
  photos: GuestPhoto[]
  isLoading: boolean
}

export function GuestPhotosSection({ photos, isLoading }: GuestPhotosSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  const handleDownload = async (e: React.MouseEvent, photoUrl: string, guestName: string) => {
    e.stopPropagation()
    const cleanGuestName = guestName.replace(/\s+/g, "_")
    const fileName = `Foto_de_${cleanGuestName}.jpg`

    try {
      setIsDownloading(photoUrl)
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Error al descargar la imagen:", error)
      window.open(photoUrl, "_blank")
    } finally {
      setIsDownloading(null)
    }
  }

  useEffect(() => {
    if (selectedIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null)
      if (e.key === "ArrowLeft") setSelectedIndex(prev => prev !== null ? Math.max(0, prev - 1) : null)
      if (e.key === "ArrowRight") setSelectedIndex(prev => prev !== null ? Math.min(photos.length - 1, prev + 1) : null)
    }

    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [selectedIndex, photos.length])

  // Cambiado bg-muted/30 por bg-transparent en el estado de carga
  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-black/5 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-black/5 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-black/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    /* ¡AQUÍ ESTÁ EL CAMBIO CLAVE! 
       Cambiamos 'bg-muted/30' por 'bg-transparent' para que este componente deje pasar 
       el color rosa que configuramos en el page.tsx y no pinte nada en blanco. */
    <section className="py-12 px-4 bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-foreground mb-4">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Fotos de Invitados</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            Momentos Compartidos
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Fotos capturadas por nuestros queridos invitados durante la celebración
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
              <Camera className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              Aún no hay fotos de invitados
            </p>
            <p className="text-sm text-muted-foreground">
              ¡Sé el primero en compartir un momento especial!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {photos.map((photo, index) => (
              <div
                key={photo.name}
                onClick={() => setSelectedIndex(index)}
                className="group cursor-pointer relative"
              >
                {/* Polaroid-style frame */}
                <div className="bg-white rounded-sm shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-rotate-1 hover:scale-105">
                  <div className="p-3 pb-0 relative">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={photo.url}
                        alt={`Foto de ${photo.guestName}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <button
                          onClick={(e) => handleDownload(e, photo.url, photo.guestName)}
                          className="p-3 rounded-full bg-white text-black shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
                          title="Descargar esta foto"
                          disabled={isDownloading === photo.url}
                        >
                          <Download className={`w-5 h-5 ${isDownloading === photo.url ? "animate-bounce" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 pt-3 flex items-center justify-between">
                    <div className="truncate max-w-[75%]">
                      <p className="text-sm font-medium text-foreground truncate">
                        {photo.guestName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {photo.createdAt.toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDownload(e, photo.url, photo.guestName)}
                      className="md:hidden p-2 rounded-full bg-muted text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={(e) => handleDownload(e, photos[selectedIndex].url, photos[selectedIndex].guestName)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 border border-white/10"
              title="Descargar Foto"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs hidden sm:inline">Descargar</span>
            </button>

            <button
              onClick={() => setSelectedIndex(null)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedIndex > 0 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex - 1)}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {selectedIndex < photos.length - 1 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex + 1)}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="bg-white p-4 pb-16 rounded-sm shadow-2xl max-w-3xl max-h-[85vh] mx-4 relative">
            <div className="relative">
              <Image
                src={photos[selectedIndex].url}
                alt={`Foto de ${photos[selectedIndex].guestName}`}
                width={800}
                height={800}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-lg font-serif text-black">
                {photos[selectedIndex].guestName}
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
            {selectedIndex + 1} de {photos.length}
          </div>
        </div>
      )}
    </section>
  )
}
