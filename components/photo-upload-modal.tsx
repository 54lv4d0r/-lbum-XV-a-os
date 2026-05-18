"use client"

import { useState, useRef } from "react"
import { X, Upload, ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase, BUCKET_NAME } from "@/lib/supabase"

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: () => void
}

export function PhotoUploadModal({ isOpen, onClose, onUploadSuccess }: PhotoUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [guestName, setGuestName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    setSelectedFiles(prev => [...prev, ...imageFiles])
    
    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const totalFiles = selectedFiles.length
      let uploadedCount = 0

      for (const file of selectedFiles) {
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'anonimo'
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        
        // CORRECCIÓN: Ahora guarda explícitamente dentro de la carpeta 'invitados'
        const fileName = `invitados/guest_${sanitizedName}_${timestamp}_${randomId}.${extension}`

        console.log('[v0] Uploading to bucket:', BUCKET_NAME, 'file:', fileName)

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            contentType: file.type, // Asegura que Supabase reconozca que es una imagen real para mostrarla
            upsert: false
          })

        if (error) {
          console.error('[v0] Upload error:', error)
          throw error
        }

        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
      }

      // Reset and close
      setSelectedFiles([])
      setPreviews([])
      setGuestName("")
      setUploadProgress(0)
      onUploadSuccess()
      onClose()
    } catch (error: unknown) {
      console.error('[v0] Upload failed:', error)
      const err = error as { message?: string; statusCode?: string }
      if (err.message?.includes('row-level security') || err.statusCode === '403') {
        alert('Error de permisos: El bucket de Supabase no permite subidas públicas. Contacta al administrador para configurar las políticas de Storage.')
      } else if (err.message?.includes('Bucket not found')) {
        alert('Error: No se encontró el bucket "fotos". Verifica que exista en Supabase Storage.')
      } else if (err.message?.includes('The resource already exists')) {
        alert('Error: Ya existe un archivo con ese nombre. Intenta de nuevo.')
      } else {
        alert(`Error al subir las fotos: ${err.message || 'Error desconocido'}. Por favor intenta de nuevo.`)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-serif font-semibold text-foreground">
            Subir Fotos
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Guest Name Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tu nombre (opcional)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Escribe tu nombre..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={uploading}
            />
          </div>

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">
              Haz clic para seleccionar fotos
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG o WEBP (máx. 10MB por foto)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                {previews.length} foto{previews.length !== 1 ? 's' : ''} seleccionada{previews.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-foreground/70 text-background opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Subiendo...</span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="w-full py-6 text-base font-medium"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Subiendo fotos...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Subir {selectedFiles.length > 0 ? `${selectedFiles.length} foto${selectedFiles.length !== 1 ? 's' : ''}` : 'fotos'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
