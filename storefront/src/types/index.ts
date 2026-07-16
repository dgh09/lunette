// Medusa Product Types
export interface MedusaCategory {
  id: string
  name: string
  handle: string
}

export interface MedusaVariantPrice {
  amount: number
  currency_code: string
}

export interface MedusaVariant {
  id: string
  title: string // "S / Crema"
  prices: MedusaVariantPrice[]
  inventory_quantity?: number
}

export interface MedusaProduct {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images: { id: string; url: string }[]
  categories: MedusaCategory[]
  variants: MedusaVariant[]
}

// Cart Types (Fase 3 los reemplazará con tipos de Medusa)
export interface CartItem {
  id: string
  quantity: number
  title: string
  thumbnail: string | null
  unit_price: number
  variant?: {
    id: string
    title: string
  }
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  total: number
}

// Customer Types (Fase 4 los completará)
export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
}

// Order Types (Fase 6 los completará)
export interface Order {
  id: string
  display_id: number
  status: string
  total: number
  created_at: string
}

export interface ApiError {
  error: string
  message: string
}
