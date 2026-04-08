/**
 * ═══════════════════════════════════════════════════════════════
 *  Dashboard Page - Main POS Interface
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { usePOSStore } from '../store/posStore'
import { apiService } from '../services/api'
import { AppSidebar } from '../components/App-Sidebar'
import ProductGrid from '../components/ProductGrid'
import CartSidebar from '../components/CartSidebar'
import TopBar from '../components/TopBar'
import { SidebarProvider, SidebarInset } from '@mashsia/ui'
import { Product } from '../types'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const {
    categories,
    products,
    selectedCategory,
    setCategories,
    setProducts,
    setSelectedCategory,
    isLoading,
    setLoading,
  } = usePOSStore()

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [selectedCategory, products])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        apiService.getCategories(),
        apiService.getProducts(),
      ])
      setCategories(cats)
      setProducts(prods)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (!selectedCategory) {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(
        products.filter((p) => p.categoryId === selectedCategory)
      )
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-slate-900 flex flex-col overflow-hidden p-0 h-screen">
        {/* Fixed Top Bar */}
        <div className=" z-40">
          <TopBar user={user} />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 flex overflow-hidden gap-3 pl-2 ">
          {/* Products Section with Categories */}
          <div className="flex-1 flex flex-col overflow-hidden gap-2">
            {/* Categories Grid - Fixed at top, scrollable below */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 ">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Categories</h3>
              <div className="grid grid-cols-4 gap-2">
                {/* All Items Button */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`
                    py-3 px-2 rounded-lg text-xs font-semibold transition-all duration-200 text-center
                    ${
                      selectedCategory === null
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }
                  `}
                >
                  All Items
                </button>

                {/* Category Buttons */}
                {categories.slice(0, 7).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      py-3 px-2 rounded-lg text-xs font-semibold transition-all duration-200 text-center flex flex-col items-center justify-center gap-1
                      ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">🍵</span>
                    <span className="line-clamp-1 text-xs">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid - Scrollable Main Section */}
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
            />
          </div>

          {/* Fixed Right Cart Sidebar */}
          <div className="">
            <CartSidebar />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

