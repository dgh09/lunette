'use client'

import { ShoppingCart, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore, CartProduct, CartVariant } from '@/store/cart-store'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: CartProduct
  variant: CartVariant | null
  quantity?: number
  disabled?: boolean
  showIcon?: boolean
  fullWidth?: boolean
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  disabled = false,
  showIcon = true,
  fullWidth = true,
}: AddToCartButtonProps) {
  const { addItem, getItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isInCart = variant ? !!getItem(product.id, variant.id) : false

  const handleAddToCart = async () => {
    if (!variant) return

    setIsAdding(true)

    // Simular pequeño delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 300))

    addItem(product, variant, quantity)

    setIsAdding(false)
    setJustAdded(true)

    // Reset estado después de 2 segundos
    setTimeout(() => setJustAdded(false), 2000)
  }

  const isDisabled = disabled || !variant || variant.stock === 0 || isAdding

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={fullWidth ? 'w-full' : ''}
      size="lg"
      variant={justAdded ? 'outline' : 'default'}
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Agregando...
        </>
      ) : justAdded ? (
        <>
          <Check className="mr-2 h-5 w-5 text-green-600" />
          Agregado al carrito
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-5 w-5" />}
          {isInCart ? 'Agregar más' : 'Agregar al carrito'}
        </>
      )}
    </Button>
  )
}

// Versión simplificada para usar con productId y variantId (compatibilidad)
interface SimpleAddToCartButtonProps {
  productId: string
  variantId: string | null
  disabled?: boolean
}

export function SimpleAddToCartButton({
  productId,
  variantId,
  disabled,
}: SimpleAddToCartButtonProps) {
  const { openCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!variantId) {
      // Mostrar mensaje de seleccionar variante
      return
    }

    setIsLoading(true)
    // Aquí normalmente harías fetch del producto completo
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
    openCart()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading || !variantId}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-5 w-5" />
      )}
      Agregar al carrito
    </Button>
  )
}
