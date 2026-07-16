import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { medusa } from '@/lib/medusa'
import { formatMedusaPrice } from '@/lib/utils'

// Depende de la Store API de Medusa en runtime; no se pre-renderiza en build.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ products: featuredProducts }, { product_categories: categories }] =
    await Promise.all([
      medusa.store.product.list({
        limit: 4,
        fields: "+categories,*variants,*variants.prices",
      }),
      medusa.store.category.list(),
    ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80"
            alt="Summer Calls - Lunette"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center text-white">
            <h1 className="mb-4 font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">
              Summer Calls
            </h1>
            <p className="mb-6 max-w-md px-4 text-lg text-white/90">
              Descubre nuestra nueva colección de verano
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-brand-red transition hover:bg-brand-cream"
            >
              Comprar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center font-serif text-3xl font-bold text-brand-red">
              Categorías
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/productos?categoria=${category.handle}`}
                  className="group relative h-40 overflow-hidden rounded-lg bg-brand-cream flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="relative p-6 text-center">
                    <h3 className="font-serif text-2xl font-bold text-brand-red group-hover:underline">
                      {category.name}
                    </h3>
                    <span className="mt-2 inline-flex items-center text-sm text-brand-red/80 group-hover:text-brand-red">
                      Ver productos <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-brand-cream py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-bold text-brand-red">
                Must Have
              </h2>
              <Link
                href="/productos"
                className="inline-flex items-center text-sm font-medium text-brand-red hover:underline"
              >
                Ver todo <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product: any) => {
                const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0
                const category = product.categories?.[0]
                return (
                  <Link
                    key={product.id}
                    href={`/productos/${product.handle}`}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                      {product.thumbnail && (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">{category?.name}</p>
                      <h3 className="mt-1 font-medium text-gray-900 group-hover:text-brand-red">
                        {product.title}
                      </h3>
                      <p className="mt-1 font-semibold text-brand-red">
                        {formatMedusaPrice(price)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="relative">
        <div className="relative h-[400px] sm:h-[500px]">
          <Image
            src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1600&q=80"
            alt="Must Have Lunette"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="mb-2 font-serif font-semibold text-brand-red">Envío Gratis</h3>
              <p className="text-sm text-gray-600">En compras mayores a $999</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="mb-2 font-serif font-semibold text-brand-red">Pago Seguro</h3>
              <p className="text-sm text-gray-600">Transacciones 100% seguras</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink">
                <span className="text-2xl">↩️</span>
              </div>
              <h3 className="mb-2 font-serif font-semibold text-brand-red">Devoluciones</h3>
              <p className="text-sm text-gray-600">15 días para cambios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-2 font-serif text-3xl font-bold text-brand-red">
            Síguenos en Instagram
          </h2>
          <p className="mb-8 text-gray-600">@lunette</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
                alt="Instagram"
                fill
                className="object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"
                alt="Instagram"
                fill
                className="object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=80"
                alt="Instagram"
                fill
                className="object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80"
                alt="Instagram"
                fill
                className="object-cover hover:scale-105 transition duration-300"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
