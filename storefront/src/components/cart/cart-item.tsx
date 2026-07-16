'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, CartItem as CartItemType } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  compact?: boolean
}

export function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleIncrement = () => {
    if (item.quantity < item.variant.stock) {
      updateQuantity(item.id, item.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  if (compact) {
    return (
      <div className="flex gap-3 py-3">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          {item.product.image ? (
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <Link
              href={`/productos/${item.product.slug}`}
              className="text-sm font-medium hover:text-primary"
            >
              {item.product.name}
            </Link>
            <p className="text-xs text-gray-500">
              {item.variant.size} / {item.variant.color}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleDecrement}
                className="rounded p-1 hover:bg-gray-100"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={handleIncrement}
                className="rounded p-1 hover:bg-gray-100"
                disabled={item.quantity >= item.variant.stock}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <span className="text-sm font-medium">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        </div>

        <button
          onClick={() => removeItem(item.id)}
          className="self-start p-1 text-gray-400 hover:text-red-500"
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4 border-b py-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {item.product.image ? (
          <Image
            src={item.product.image}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/productos/${item.product.slug}`}
              className="font-medium hover:text-primary"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
            <p className="text-sm text-gray-500">
              Talla: {item.variant.size} | Color: {item.variant.color}
            </p>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="h-fit p-1 text-gray-400 hover:text-red-500"
            aria-label="Eliminar producto"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-md border">
            <button
              onClick={handleDecrement}
              className="px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center">{item.quantity}</span>
            <button
              onClick={handleIncrement}
              className="px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
              disabled={item.quantity >= item.variant.stock}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              {formatPrice(item.product.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-gray-500">
                {formatPrice(item.product.price)} c/u
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
