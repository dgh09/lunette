import { Suspense } from 'react'
import { ProductCard } from '@/components/products/product-card'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductSort } from '@/components/products/product-sort'
import { SlidersHorizontal } from 'lucide-react'
import { medusa } from '@/lib/medusa'

interface ProductsPageProps {
  searchParams: {
    categoria?: string
    ordenar?: string
    page?: string
  }
}

// Depende de la Store API de Medusa en runtime; no se pre-renderiza en build.
export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { categoria, ordenar = 'newest' } = searchParams

  const { product_categories: categories } = await medusa.store.category.list()

  const productParams: Record<string, any> = {
    fields: "+categories,*variants,*variants.prices",
    limit: 100,
  }

  if (categoria) {
    const cat = categories.find((c: any) => c.handle === categoria)
    if (cat) productParams["category_id[]"] = [cat.id]
  }

  const orderMap: Record<string, string> = {
    'price-asc': 'variants.prices.amount',
    'price-desc': '-variants.prices.amount',
    'name-asc': 'title',
    'name-desc': '-title',
    'newest': '-created_at',
  }
  if (orderMap[ordenar]) {
    productParams.order = orderMap[ordenar]
  }

  const { products } = await medusa.store.product.list(productParams)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-red">Tienda</h1>
        <p className="mt-2 text-gray-600">
          Descubre toda la colección Lunette
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block">
          <Suspense fallback={<div>Cargando filtros...</div>}>
            <ProductFilters categories={categories as any} />
          </Suspense>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            {/* Mobile Filter Button */}
            <button className="flex items-center gap-2 rounded-md border border-brand-red px-4 py-2 text-sm text-brand-red lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </button>

            <p className="text-sm text-gray-500">
              {products.length} productos
            </p>

            <Suspense fallback={null}>
              <ProductSort />
            </Suspense>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500">
              No se encontraron productos con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
