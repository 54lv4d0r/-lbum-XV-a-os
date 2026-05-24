"use client"

import { useState, useEffect, useCallback } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { GallerySkeleton } from "@/components/gallery-skeleton"
import { GuestPhotosSection } from "@/components/guest-photos-section"
import { PhotoUploadModal } from "@/components/photo-upload-modal"
import { Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface GuestPhoto {
  name: string
  url: string
  guestName: string
  createdAt: Date
}

export default function GalleryPage() {
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([])
  const [guestLoading, setGuestLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // LEER LAS FOTOS DE LOS INVITADOS
  const fetchGuestPhotos = useCallback(async () => {
    try {
      setGuestLoading(true)
      let currentBucket = "FOTOS"
      const currentFolder = "invitados"
      
      let { data: files, error: guestError } = await supabase.storage
        .from(currentBucket)
        .list(currentFolder, { limit: 100, offset: 0 })

      if (guestError || !files || files.length === 0) {
        currentBucket = "fotos"
        const { data: retryFiles } = await supabase.storage
          .from(currentBucket)
          .list(currentFolder, { limit: 100, offset: 0 })
        files = retryFiles
      }

      const imageFiles = (files || []).filter((file) => {
        const ext = file.name.toLowerCase().split(".").pop()
        return ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext || "")
      })

      const guestPhotoList = imageFiles.map((file) => {
        const cleanName = file.name.startsWith("guest_") ? file.name.replace("guest_", "") : file.name
        const parts = cleanName.split("_")
        const guestName = parts[0]?.replace(/-/g, " ") || "Invitado"
        
        const { data } = supabase.storage
          .from(currentBucket)
          .getPublicUrl(`${currentFolder}/${file.name}`)

        return {
          name: file.name,
          url: data.publicUrl,
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

  // ¡AQUÍ ESTÁ EL CAMBIO ESENCIAL!
  // Al poner "/portada.jpg", Next.js sabe automáticamente que debe buscar el archivo dentro de la carpeta 'public'.
  const coverImage = "/banner_fabianna02.gif"

  return (
    <main className="min-h-screen bg-background">
      <HeroBanner
       title={<>Mis XV Años<br />Fabianna</>}
        subtitle="Ayudame a crear una hermosa colección de recuerdos"
        photoCount={guestPhotos.length}
        coverImage={coverImage}
      />

      {/* Action Bar */}
      // LÍNEA NUEVA EN PAGE.TSX:
<div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Galería de Fotos</h2>
            <p className="text-sm text-muted-foreground">
              {guestLoading ? "Cargando..." : `${guestPhotos.length} fotos compartidas`}
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Agregar Foto
          </Button>
        </div>
      </div>

      {/* Sección Momentos Compartidos */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <GuestPhotosSection 
          photos={guestPhotos} 
          isLoading={guestLoading} 
        />
      </div>

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
