import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Mis XV Años Fabianna - Galería de Fotos',
  description: 'Una hermosa colección de recuerdos de mis quinceaños',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    /* 1. Quitamos bg-background de aquí para que no interfiera */
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      {/* 2. EL CAMBIO MAESTRO: 
          - bg-[#FAF4F2] le mete el rosa viejo en duro directamente al cuerpo real de la web.
          - min-h-screen obliga a este fondo rosa a estirarse infinitamente hacia abajo.
      */}
      <body className="font-sans antialiased bg-[#FAF4F2] min-h-screen text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
