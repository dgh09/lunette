'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, Search, LogOut, Settings, ShoppingBag } from 'lucide-react'
import { CartButton } from '@/components/cart'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Tienda', href: '/productos' },
  { name: 'Tops', href: '/categorias/tops' },
  { name: 'Bottoms', href: '/categorias/bottoms' },
  { name: 'Nueva Colección', href: '/nueva-coleccion' },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="logo-main text-2xl tracking-wide">LUNETTE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition hover:text-brand-red"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-brand-red">
            <Search className="h-5 w-5" />
          </button>
          
          {/* User Menu */}
          {status === 'loading' ? (
            <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full p-2 text-gray-600 hover:text-brand-red"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red text-sm font-medium text-white">
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border bg-white py-2 shadow-lg">
                    <div className="border-b px-4 py-3">
                      <p className="font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/cuenta"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Mi Cuenta
                    </Link>
                    <Link
                      href="/cuenta/pedidos"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Mis Pedidos
                    </Link>
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Panel Admin
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-red-dark"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Ingresar</span>
            </Link>
          )}

          <CartButton />

          {/* Mobile menu button */}
          <button
            className="p-2 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-brand-cream hover:text-brand-red"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!session && (
              <Link
                href="/login"
                className="block rounded-md bg-brand-red px-3 py-2 text-center text-base font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
