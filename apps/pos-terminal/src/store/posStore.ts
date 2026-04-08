/**
 * ═══════════════════════════════════════════════════════════════
 *  Zustand POS Store - Cart, Products, Categories
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand'
import { CartItem, Product, Category, Order } from '../types'

interface POSState {
  // Cart state
  cart: CartItem[]
  currentOrder: Partial<Order> | null
  
  // Product Data
  products: Product[]
  categories: Category[]
  selectedCategory: string | null
  searchQuery: string
  
  // UI State
  isLoading: boolean
  error?: string
  
  // Actions
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (cartItemId: string) => void
  updateCartItem: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  setCurrentOrder: (order: Partial<Order> | null) => void
  
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setSelectedCategory: (categoryId: string | null) => void
  setSearchQuery: (query: string) => void
  
  setLoading: (isLoading: boolean) => void
  setError: (error?: string) => void
  reset: () => void
}

export const usePOSStore = create<POSState>((set) => ({
  // Initial state
  cart: [],
  currentOrder: null,
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  error: undefined,

  // Cart actions
  addToCart: (product: Product, quantity: number) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.product.id === product.id)
      
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }
      
      return {
        cart: [
          ...state.cart,
          {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            customizations: [],
            notes: '',
          },
        ],
      }
    }),

  removeFromCart: (cartItemId: string) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId),
    })),

  updateCartItem: (cartItemId: string, quantity: number) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cart: [], currentOrder: null }),

  setCurrentOrder: (order: Partial<Order> | null) =>
    set({ currentOrder: order }),

  // Product actions
  setProducts: (products: Product[]) =>
    set({ products, error: undefined }),

  setCategories: (categories: Category[]) =>
    set({ categories, error: undefined }),

  setSelectedCategory: (categoryId: string | null) =>
    set({ selectedCategory: categoryId }),

  setSearchQuery: (query: string) =>
    set({ searchQuery: query }),

  // UI actions
  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error?: string) => set({ error }),

  reset: () =>
    set({
      cart: [],
      currentOrder: null,
      products: [],
      categories: [],
      selectedCategory: null,
      searchQuery: '',
      isLoading: false,
      error: undefined,
    }),
}))
