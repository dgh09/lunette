'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, Truck, RotateCcw, Shield, Minus, Plus } from 'lucide-react'
import { ProductGallery } from '@/components/products/product-gallery'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { ProductCard } from '@/components/products/product-card'
import { formatMedusaPrice } from '@/lib/utils'

interface MedusaVariant {
  id: string
  title: string // "S / Crema"
  prices: { amount: number; currency_code: string }[]
  inventory_quantity?: number
}

interface MedusaCategory {
  id: string
  name: string
  handle: string
}

interface MedusaProduct {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images: { id: string; url: string }[]
  categories: MedusaCategory[]
  variants: MedusaVariant[]
}

interface ProductDetailProps {
  product: MedusaProduct
  relatedProducts: MedusaProduct[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const category = product.categories?.[0]
  const images = product.images?.map((img) => img.url) ?? (product.thumbnail ? [product.thumbnail] : [])
  const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0

  // Parse sizes and colors from variant titles like "S / Crema"
  const sizes = [...new Set(product.variants.map((v) => v.title.split(' / ')[0]).filter(Boolean))]
  const colors = [...new Set(product.variants.map((v) => v.title.split(' / ')[1] ?? '').filter(Boolean))]

  const selectedVariant = product.variants.find((v) => {
    const [vSize, vColor] = v.title.split(' / ')
    return vSize === selectedSize && vColor === selectedColor
  })

  const stock = selectedVariant?.inventory_quantity ?? 50

  const cartProduct = {
    id: product.id,
    name: product.title,
    slug: product.handle,
    price: price / 100,
    image: product.thumbnail || images[0] || '',
    category: category?.name || '',
  }

  const cartVariant = selectedVariant
    ? {
        id: selectedVariant.id,
        size: selectedVariant.title.split(' / ')[0] ?? '',
        color: selectedVariant.title.split(' / ')[1] ?? '',
        stock,
      }
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/productos" className="hover:text-gray-900">Productos</Link>
        <ChevronRight className="h-4 w-4" />
        {category && (
          <>
            <Link href={`/productos?categoria=${category.handle}`} className="hover:text-gray-900">
              {category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-gray-900">{product.title}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={images} productName={product.title} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">{category?.name}</p>
            <h1 className="mt-1 text-3xl font-bold">{product.title}</h1>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{formatMedusaPrice(price)}</span>
          </div>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <h3 className="mb-3 font-medium">
                Color: <span className="text-gray-500">{selectedColor || 'Selecciona'}</span>
              </h3>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-md border px-4 py-2 text-sm transition ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">
                  Talla: <span className="text-gray-500">{selectedSize || 'Selecciona'}</span>
                </h3>
                <button className="text-sm text-primary hover:underline">Guía de tallas</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] rounded-md border px-4 py-2 text-sm transition ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="mb-3 font-medium">Cantidad</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 hover:bg-gray-50"
                  disabled={quantity >= stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <AddToCartButton
            product={cartProduct}
            variant={cartVariant}
            quantity={quantity}
            disabled={!selectedVariant}
          />

          {(!selectedColor || !selectedSize) && (
            <p className="text-sm text-amber-600">
              Selecciona color y talla para continuar
            </p>
          )}

          {/* Features */}
          <div className="grid gap-4 border-t pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Envío gratis</p>
                <p className="text-xs text-gray-500">En compras +$500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Devoluciones</p>
                <p className="text-xs text-gray-500">30 días</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Pago seguro</p>
                <p className="text-xs text-gray-500">SSL encriptado</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t pt-6">
              <h3 className="mb-3 font-medium">Descripción</h3>
              <div className="prose prose-sm text-gray-600">
                {product.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Productos Relacionados</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
