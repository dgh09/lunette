'use client'

import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Trash2, Tag } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { CartItem } from '@/components/cart/cart-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'

export default function CartPage() {
  const { items, clearCart, getSubtotal, getItemCount } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const shippingThreshold = 500
  const freeShipping = subtotal >= shippingThreshold
  const shippingCost = freeShipping ? 0 : 99
  const total = subtotal + shippingCost

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón')
      return
    }
    // TODO: Validar cupón con API
    setCouponError('Cupón no válido')
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
            <p className="mt-2 text-gray-500">
              Parece que aún no has agregado productos a tu carrito
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/productos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Explorar productos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Carrito de Compras</h1>
        <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Vaciar carrito
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          {/* Free shipping banner */}
          {!freeShipping && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Agrega{' '}
                <span className="font-semibold">
                  {formatPrice(shippingThreshold - subtotal)}
                </span>{' '}
                más para obtener <span className="font-semibold">envío gratis</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-200">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min((subtotal / shippingThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Cart items */}
          <div className="rounded-lg border bg-white">
            <div className="p-4">
              <p className="text-sm text-gray-500">{itemCount} productos</p>
            </div>
            <div className="px-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Continue shopping */}
          <div className="mt-6">
            <Link
              href="/productos"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuar comprando
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 lg:mt-0">
          <div className="sticky top-24 rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Resumen del Pedido</h2>

            {/* Coupon */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                Código de descuento
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Ingresa tu código"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value)
                      setCouponError('')
                    }}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleApplyCoupon}>
                  Aplicar
                </Button>
              </div>
              {couponError && (
                <p className="mt-1 text-sm text-red-500">{couponError}</p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({itemCount} productos)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envío</span>
                <span className={freeShipping ? 'text-green-600' : ''}>
                  {freeShipping ? 'Gratis' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout button */}
            <Button asChild className="mt-6 w-full" size="lg">
              <Link href="/checkout">Proceder al pago</Link>
            </Button>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span>🔒</span> Pago seguro
              </span>
              <span className="flex items-center gap-1">
                <span>🚚</span> Envío rápido
              </span>
              <span className="flex items-center gap-1">
                <span>↩️</span> Devoluciones fáciles
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
