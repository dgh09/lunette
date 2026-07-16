'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductFiltersProps {
  categories: { id: string; name: string; handle: string }[]
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = [
  { name: 'Negro', value: 'negro', hex: '#000000' },
  { name: 'Blanco', value: 'blanco', hex: '#FFFFFF' },
  { name: 'Gris', value: 'gris', hex: '#6B7280' },
  { name: 'Azul', value: 'azul', hex: '#3B82F6' },
  { name: 'Rojo', value: 'rojo', hex: '#EF4444' },
  { name: 'Verde', value: 'verde', hex: '#22C55E' },
]
const priceRanges = [
  { label: 'Menos de $500', value: '0-500' },
  { label: '$500 - $1,000', value: '500-1000' },
  { label: '$1,000 - $2,000', value: '1000-2000' },
  { label: 'Más de $2,000', value: '2000-99999' },
]

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('categoria')
  const currentSize = searchParams.get('talla')
  const currentColor = searchParams.get('color')
  const currentPrice = searchParams.get('precio')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete('page') // Reset page when filtering
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (name: string, value: string) => {
    const currentValue = searchParams.get(name)
    const newValue = currentValue === value ? '' : value
    router.push(`/productos?${createQueryString(name, newValue)}`)
  }

  const clearFilters = () => {
    router.push('/productos')
  }

  const hasActiveFilters = currentCategory || currentSize || currentColor || currentPrice

  return (
    <aside className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold">Categorías</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterChange('categoria', category.handle)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                currentCategory === category.handle
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="mb-3 font-semibold">Tallas</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleFilterChange('talla', size)}
              className={`rounded border px-3 py-1 text-sm transition ${
                currentSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="mb-3 font-semibold">Colores</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleFilterChange('color', color.value)}
              title={color.name}
              className={`h-8 w-8 rounded-full border-2 transition ${
                currentColor === color.value
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-semibold">Precio</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleFilterChange('precio', range.value)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                currentPrice === range.value
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
