import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

export interface CartVariant {
  id: string
  size: string
  color: string
  stock: number
}

export interface CartItem {
  id: string
  product: CartProduct
  variant: CartVariant
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (product: CartProduct, variant: CartVariant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  
  // Computed
  getItemCount: () => number
  getSubtotal: () => number
  getItem: (productId: string, variantId: string) => CartItem | undefined
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(
          (item) => item.product.id === product.id && item.variant.id === variant.id
        )

        if (existingItem) {
          // Actualizar cantidad si ya existe
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            variant.stock
          )
          set({
            items: items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          })
        } else {
          // Agregar nuevo item
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}`,
            product,
            variant,
            quantity: Math.min(quantity, variant.stock),
          }
          set({ items: [...items, newItem] })
        }

        // Abrir el carrito después de agregar
        set({ isOpen: true })
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.min(quantity, item.variant.stock) }
              : item
          ),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItem: (productId, variantId) => {
        return get().items.find(
          (item) => item.product.id === productId && item.variant.id === variantId
        )
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // Solo persistir items
    }
  )
)
