import { useNavigate } from "react-router-dom";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const stockQty = product.stockQuantity ?? 0;
  const lowStockThreshold = product.lowStockThreshold ?? 10;
  const isOutOfStock = stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= lowStockThreshold;

  const handleClick = () => {
    if (!isOutOfStock) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOutOfStock}
      className={`w-full h-full rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex h-12 w-12 items-center  justify-center rounded-md bg-slate-800 text-xl">
        {product.name?.charAt(0).toUpperCase() ?? "P"}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold text-white line-clamp-2">
          {product.name}
        </p>
        <p className="text-xs text-slate-300 line-clamp-3 ">
          {product.description ?? "POS menu item"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-white">
          ₱{parseFloat(product.price ?? "0").toFixed(2)}
        </span>
        <span className="text-xs text-slate-400">
          Stock: {stockQty.toString()}
        </span>
      </div>

      {isOutOfStock && (
        <p className="mt-3 rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
          Out of stock
        </p>
      )}

      {isLowStock && !isOutOfStock && (
        <p className="mt-3 rounded bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-200">
          Low stock
        </p>
      )}
    </button>
  );
}
