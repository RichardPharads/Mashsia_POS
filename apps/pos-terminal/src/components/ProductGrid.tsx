/**
 * ═══════════════════════════════════════════════════════════════
 *  Product Grid Component - Product Display Grid
 * ═══════════════════════════════════════════════════════════════
 */

import { Product } from '../types'
import ProductCard from './productCard'

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex-1 bg-neutral-950 rounded-lg border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 bg-neutral-950 rounded-lg border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-2">No products available</p>
          <p className="text-slate-500 text-sm">Select a category or check back later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full bg-nutral-950 rounded-lg border border-slate-700 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
      <div className="grid grid-cols-4 gap-5 place-items-center p-4 auto-rows-max h-min">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
