import { Product } from '../types'
import { useNavigate } from 'react-router-dom'
import image from '../assets/Stylish Reusable Coffee Cup with Modern Design.jpg'
interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()

  const isLowStock =
    Number(product.stockQuantity) <= Number(product.lowStockThreshold)
  const isOutOfStock = Number(product.stockQuantity) === 0

  const handleCardClick = () => {
    if (!isOutOfStock) {
      navigate(`/product/${product.id}`)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative group overflow-hidden rounded-2xl 
        transition-all duration-300 
        cursor-pointer w-45 h-45
        
        ${isOutOfStock
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:scale-[1.03] hover:shadow-xl'}
      `}
      style={{
        backgroundColor: '#2A2A2A',
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />

      {/* Product Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={image}
          alt={product.name}
          className="h-full object-contain drop-shadow-xl brightness-50 opacity-50"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4">
        {/* Top */}
        <div>
          <h3 className="text-white text-lg font-semibold leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Bottom */}
        <div>
          <p className="text-gray-300 text-sm line-through opacity-70">
            ₱{(parseFloat(product.price) * 1.2).toFixed(2)}
          </p>
          <p className="text-white text-lg font-bold">
            ₱{parseFloat(product.price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Low Stock Badge */}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-2 py-1 rounded-md font-semibold">
          LOW
        </div>
      )}

      {/* Out of Stock */}
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-bold">
          OUT OF STOCK
        </div>
      )}
    </div>
  )
}