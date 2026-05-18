"use client"

import { useState, useEffect, useCallback } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { MasonryGallery } from "@/components/masonry-gallery"
import { GallerySkeleton } from "@/components/gallery-skeleton"
import { GuestPhotosSection } from "@/components/guest-photos-section"
import { PhotoUploadModal } from "@/components/photo-upload-modal"
import { Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase, BUCKET_NAME } from "@/lib/supabase"

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://figtuyydceiqcqqlyzhj.supabase.co"

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [guestLoading, setGuestLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Fetch main gallery photos using Supabase client
  useEffect(() => {
    async function fetchPhotos() {
      try {
        console.log("[v0] Fetching photos from bucket:", BUCKET_NAME)
        
        const { data: files, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list("", {
            limit: 100,
            offset: 0,
          })

        if (error) {
          console.error("[v0] Supabase list error:", error)
          throw error
        }

        console.log("[v0] Files received:", files)

        const imageFiles = (files || []).filter((file) => {
          const ext = file.name.toLowerCase().split(".").pop()
          // Excluimos la carpeta de invitados y cualquier archivo suelto antiguo
          const isGuestPhoto = file.name.startsWith("guest_") || file.name === "invitados"
          return !isGuestPhoto && ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext || "")
        })

        const photoList: Photo[] = imageFiles.map((file, index: number) => ({
          id: file.id || `photo-${index}`,
          url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${file.name}`,
          name: file.name,
        }))

        console.log("[v0] Processed photos:", photoList.length)
        setPhotos(photoList)
      } catch (err) {
        console.error("[v0] Error fetching photos:", err)
        setError("No se pudieron cargar las fotos. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  // CORRECCIÓN: Fetch guest photos mirando exclusivamente dentro de la carpeta 'invitados'
  const fetchGuestPhotos = useCallback(async () => {
    try {
      setGuestLoading(true)
      console.log("[v0] Fetching guest photos from 'invitados' folder")
      
      // Indicamos a Supabase que liste los archivos internos de la carpeta 'invitados'
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list("invitados", {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error("[v0] Supabase guest list error:", error)
        throw error
      }

      console.log("[v0] Files received inside 'invitados':", files)

      // Filtramos los formatos de imagen correctos
      const imageFiles = (files || []).filter((file) => {
        const ext = file.name.toLowerCase().split(".").pop()
        return ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext || "")
      })

      const guestPhotoList: GuestPhoto[] = imageFiles.map((file) => {
        // Limpiamos el prefijo 'guest_' del nombre interno para extraer quién lo envió
        const fileName = file.name.replace("guest_", "")
        const parts = fileName.split("_")
        const guestName = parts[0]?.replace(/-/g, " ") || "Invitado"
        
        return {
          name: file.name,
          // CORRECCIÓN DE LA URL: Añadimos /invitados/ en la ruta para que se previsualice la imagen real
          url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/invitados/${file.name}`,
          guestName: guestName === "anonimo" ? "Anónimo" : guestName,
          createdAt: file.created_at ? new Date(file.created_at) : new Date(),
        }
      })

      // Ordenar por fecha, más reciente primero
      guestPhotoList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      console.log("[v0] Processed guest photos:", guestPhotoList.length)
      setGuestPhotos(guestPhotoList)
    } catch (err) {
      console.error("[v0] Error fetching guest photos:", err)
    } finally {
      setGuestLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGuestPhotos()
  }, [fetchGuestPhotos])

  const handleUploadSuccess = () => {
    // Actualiza las fotos tras una subida exitosa
    fetchGuestPhotos()
  }

  // Use the first photo as the cover image
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
