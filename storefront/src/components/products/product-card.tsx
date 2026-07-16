import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { formatMedusaPrice } from '@/lib/utils'

interface MedusaProductCard {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  images?: { id: string; url: string }[]
  categories?: { name: string }[]
  variants?: { prices?: { amount: number }[] }[]
}

interface ProductCardProps {
  product: MedusaProductCard
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0
  const image = product.thumbnail ?? product.images?.[0]?.url ?? null
  const categoryName = product.categories?.[0]?.name ?? ''

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <Link href={`/productos/${product.handle}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        className="absolute right-2 top-2 rounded-full bg-white p-2 opacity-0 shadow transition group-hover:opacity-100 hover:bg-gray-100"
        aria-label="Agregar a favoritos"
      >
        <Heart className="h-4 w-4" />
      </button>

      {/* Info */}
      <div className="p-4">
        <p className="mb-1 text-xs text-gray-500">{categoryName}</p>
        <Link href={`/productos/${product.handle}`}>
          <h3 className="font-medium text-gray-900 transition hover:text-primary">
            {product.title}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold">{formatMedusaPrice(price)}</span>
        </div>
      </div>
    </div>
  )
}
