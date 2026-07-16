'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

export function CartButton() {
  const { openCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-gray-600 hover:text-gray-900"
      aria-label={`Carrito (${itemCount} items)`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
