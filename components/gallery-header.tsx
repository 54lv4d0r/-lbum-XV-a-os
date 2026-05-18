import { Camera } from "lucide-react"

interface GalleryHeaderProps {
  title: string
  subtitle?: string
  photoCount: number
}

export function GalleryHeader({ title, subtitle, photoCount }: GalleryHeaderProps) {
  return (
    <header className="text-center py-12 md:py-16 lg:py-20 px-4">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
        <Camera className="w-4 h-4" />
        <span>{photoCount} Photos</span>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          {subtitle}
        </p>
      )}
    </header>
  )
}
