import { notFound } from 'next/navigation'
import { medusa } from '@/lib/medusa'
import { ProductDetail } from './product-detail'

// Depende de la Store API de Medusa en runtime; no se pre-renderiza en build.
export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { products } = await medusa.store.product.list({
    handle: params.slug,
    fields: "+categories,*variants,*variants.prices",
  })

  const product = products[0]
  if (!product) {
    notFound()
  }

  const categoryId = (product as any).categories?.[0]?.id

  const { products: relatedProducts } = categoryId
    ? await medusa.store.product.list({
        "category_id[]": [categoryId],
        fields: "+categories,*variants,*variants.prices",
        limit: 4,
      } as any)
    : { products: [] }

  const related = relatedProducts.filter((p: any) => p.id !== product.id).slice(0, 3)

  return <ProductDetail product={product as any} relatedProducts={related as any} />
}
