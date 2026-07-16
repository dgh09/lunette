'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { CartItem } from './cart-item'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export function CartSheet() {
  const { items, isOpen, closeCart, getSubtotal, getItemCount } = useCartStore()

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const shippingThreshold = 500
  const freeShipping = subtotal >= shippingThreshold

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={closeCart}
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            Carrito ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <p className="text-gray-500">Tu carrito está vacío</p>
            <Button onClick={closeCart} asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {!freeShipping && (
              <div className="border-b bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-600">
                  Agrega{' '}
                  <span className="font-semibold">
                    {formatPrice(shippingThreshold - subtotal)}
                  </span>{' '}
                  más para envío gratis
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((subtotal / shippingThreshold) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} compact />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className={freeShipping ? 'text-green-600' : ''}>
                    {freeShipping ? 'Gratis' : 'Calculado al finalizar'}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={closeCart}>
                    Finalizar compra
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                  onClick={closeCart}
                >
                  <Link href="/carrito">Ver carrito completo</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
