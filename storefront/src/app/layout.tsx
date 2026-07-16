import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartSheet } from '@/components/cart'
import { AuthProvider } from '@/components/providers/session-provider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Lunette | Moda Femenina',
  description: 'Descubre la colección Summer Calls de Lunette. Ropa femenina con estilo único y diseños exclusivos.',
  keywords: ['moda', 'ropa femenina', 'Lunette', 'summer', 'tops', 'jeans'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartSheet />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
