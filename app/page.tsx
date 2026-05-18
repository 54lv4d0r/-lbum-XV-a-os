"use client"

import { useState, useEffect, useCallback } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { MasonryGallery } from "@/components/masonry-gallery"
import { GallerySkeleton } from "@/components/gallery-skeleton"
import { GuestPhotosSection } from "@/components/guest-photos-section"
import { PhotoUploadModal } from "@/components/photo-upload-modal"
import { Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Photo {
  id: string
  url: string
  name: string
}

interface GuestPhoto {
  name: string
  url: string
  guestName: string
  createdAt: Date
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [guestLoading, setGuestLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // 1. CARGAR FOTOS PRINCIPALES (CON BÚSQUEDA HÍBRIDA DE BUCKET)
  useEffect(() => {
    async function fetchPhotos() {
      try {
        console.log("[v0] Intentando cargar fotos principales...")
        
        let bucketName = "fotos" // Intento 1: minúsculas
        let { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list("", { limit: 100, offset: 0 })

        if (listError || !files || files.length === 0) {
          console.log("[v0] Probando con 'FOTOS' (mayúsculas)...")
          bucketName = "FOTOS" // Intento 2: mayúsculas
          const { data: retryFiles } = await supabase.storage
            .from(bucketName)
            .list("", { limit: 100, offset: 0 })
          files = retryFiles
        }

        const imageFiles = (files || []).filter((file) => {
          const ext = file.name.toLowerCase().split(".").pop()
          const isGuest = file.name.toLowerCase().startsWith("guest_") || file.name.toLowerCase() === "invitados"
          return !isGuest && ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext || "")
        })

        const photoList = imageFiles.map((file, index) => {
          // GENERACIÓN DE URL OFICIAL DE SUPABASE (Infalible)
          const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name)
            
          return {
            id: file.id || `photo-${index}`,
            url: data.publicUrl, // La URL ya viene perfecta
            name: file.name,
          }
        })

        setPhotos(photoList)
      } catch (err) {
        console.error("[v0] Error trayendo fotos principales:", err)
        setError("No se pudieron cargar las fotos principales.")
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  // 2. CARGAR FOTOS DE INVITADOS (USANDO GETPUBLICURL OFICIAL)
  const fetchGuestPhotos = useCallback(async () => {
    try {
      setGuestLoading(true)
      console.log("[v0] Buscando fotos de invitados...")
      
      let currentBucket = "FOTOS" // Intento 1: mayúsculas (donde están las nuevas subidas)
      const currentFolder = "invitados"
      
      let { data: files, error: guestError } = await supabase.storage
        .from(currentBucket)
        .list(currentFolder, { limit: 100, offset: 0 })

      if (guestError || !files || files.length === 0) {
        console.log("[v0] Probando con 'fotos' (minúsculas) carpeta invitados...")
        currentBucket = "fotos" // Intento 2: minúsculas
        const { data: retryFiles } = await supabase.storage
          .from(currentBucket)
          .list(currentFolder, { limit: 100, offset: 0 })
        files = retryFiles
      }

      console.log(`[v0] Archivos leídos en ${currentBucket}/${currentFolder}:`, files?.length || 0)

      const imageFiles = (files || []).filter((file) => {
        const ext = file.name.toLowerCase().split(".").pop()
        return ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext || "")
      })

      const guestPhotoList = imageFiles.map((file) => {
        // Limpieza del nombre para sacar el invitado
        const cleanName = file.name.startsWith("guest_") ? file.name.replace("guest_", "") : file.name
        const parts = cleanName.split("_")
        const guestName = parts[0]?.replace(/-/g, " ") || "Invitado"
        
        // ¡LA SOLUCIÓN! GENERACIÓN DE URL OFICIAL DE SUPABASE
        // Le pasamos la ruta completa 'invitados/nombre_archivo.jpg'
        const { data } = supabase.storage
          .from(currentBucket)
          .getPublicUrl(`${currentFolder}/${file.name}`)

        return {
          name: file.name,
          url: data.publicUrl, // Esta URL es 100% correcta
          guestName: guestName === "anonimo" ? "Anónimo" : guestName,
          createdAt: file.created_at ? new Date(file.created_at) : new Date(),
        }
      })

      guestPhotoList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setGuestPhotos(guestPhotoList)
    } catch (err) {
      console.error("[v0] Error en fotos de invitados:", err)
    } finally {
      setGuestLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGuestPhotos()
  }, [fetchGuestPhotos])

  const handleUploadSuccess = () => {
    fetchGuestPhotos()
  }

  const coverImage = photos.length > 0 ? photos[0].url : undefined

  return (
    <main className="min-h-screen bg-background">
      <HeroBanner
        title="Mis XV Años"
        subtitle="Una hermosa colección de recuerdos celebrando este momento tan especial"
        photoCount={photos.length}
        coverImage={coverImage}
      />

      {/* Action Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Galería de Fotos</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Cargando..." : `${photos.length} fotos en el álbum`}
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Agregar Foto
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <GallerySkeleton />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No se encontraron fotos en la galería.</p>
          </div>
        ) : (
          <MasonryGallery photos={photos} />
        )}
      </div>

      {/* Guest Photos Section */}
      <GuestPhotosSection 
        photos={guestPhotos} 
        isLoading={guestLoading} 
      />

      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm">Recuerdos capturados con</span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
          </div>
        </div>
      </footer>
    </main>
  )
}
