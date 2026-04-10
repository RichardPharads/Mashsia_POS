import React from "react";
import type { Product } from "../types";
import ProductCard from "./productCard";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

/**
 * ProductGrid
 * - Exactly 4 columns on all breakpoints (per request)
 * - Each card is forced to the same height using CSS Grid + gridAutoRows: 1fr
 * - Each grid item ensures its direct child stretches to fill the grid cell:
 *   we use the Tailwind JIT group selector `[&>*]:h-full` so ProductCard gets `height:100%`.
 */
const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex-1 w-full bg-neutral-950 rounded-lg border border-slate-700 flex items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex-1 w-full bg-neutral-950 rounded-lg border border-slate-700 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-2">No products available</p>
          <p className="text-slate-500 text-sm">
            Select a category or check back later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-neutral-950 rounded-lg border border-slate-700 overflow-y-auto p-3">
      <div
        className="grid grid-cols-4 gap-4"
        // ensure each grid row is equally sized; each cell will stretch to same height
        style={{ gridAutoRows: "1fr" }}
        role="list"
        aria-label="Products"
      >
        {products.map((product) => (
          // wrapper forces direct child to fill available height
          <div key={product.id} role="listitem" className="h-full [&>*]:h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
