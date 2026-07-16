'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, ShoppingBag, Heart, MapPin, CreditCard, Settings } from 'lucide-react'

const menuItems = [
  {
    title: 'Mis Pedidos',
    description: 'Ver historial de pedidos',
    href: '/cuenta/pedidos',
    icon: ShoppingBag,
  },
  {
    title: 'Lista de Deseos',
    description: 'Productos guardados',
    href: '/cuenta/favoritos',
    icon: Heart,
  },
  {
    title: 'Direcciones',
    description: 'Gestionar direcciones de envío',
    href: '/cuenta/direcciones',
    icon: MapPin,
  },
  {
    title: 'Métodos de Pago',
    description: 'Tarjetas guardadas',
    href: '/cuenta/pagos',
    icon: CreditCard,
  },
  {
    title: 'Configuración',
    description: 'Editar perfil y preferencias',
    href: '/cuenta/configuracion',
    icon: Settings,
  },
]

export default function CuentaPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    redirect('/login?callbackUrl=/cuenta')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-red text-2xl font-bold text-white">
          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Hola, {session.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500">{session.user?.email}</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-start gap-4 rounded-lg border bg-white p-6 transition hover:border-brand-red hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink">
              <item.icon className="h-6 w-6 text-brand-red" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders Preview */}
      <div className="mt-8 rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Pedidos Recientes
          </h2>
          <Link
            href="/cuenta/pedidos"
            className="text-sm text-brand-red hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="py-8 text-center text-gray-500">
          <ShoppingBag className="mx-auto mb-2 h-12 w-12 text-gray-300" />
          <p>No tienes pedidos recientes</p>
          <Link
            href="/productos"
            className="mt-4 inline-block text-sm text-brand-red hover:underline"
          >
            Explorar productos
          </Link>
        </div>
      </div>
    </div>
  )
}
