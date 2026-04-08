/**
 * ═══════════════════════════════════════════════════════════════
 *  Product Detail Page - Product Customization
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePOSStore } from '../store/posStore'

interface CustomizationOption {
  id: string
  name: string
  options: Array<{ id: string; label: string; price: number }>
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { products, addToCart } = usePOSStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const product = products.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const customizationOptions: CustomizationOption[] = [
    {
      id: 'size',
      name: 'Size',
      options: [
        { id: 's', label: 'Small (60ml)', price: 0 },
        { id: 'm', label: 'Medium (90ml)', price: 15 },
        { id: 'l', label: 'Large (100ml)', price: 25 },
        { id: 'xl', label: 'Venti (120ml)', price: 35 },
      ],
    },
    {
      id: 'temperature',
      name: 'Temperature',
      options: [
        { id: 'hot', label: 'Hot', price: 0 },
        { id: 'cold', label: 'Cold', price: 0 },
        { id: 'iced', label: 'Iced', price: 10 },
      ],
    },
    {
      id: 'milk',
      name: 'Milk',
      options: [
        { id: 'regular', label: 'Regular Milk', price: 0 },
        { id: 'almond', label: 'Almond Milk', price: 20 },
        { id: 'oat', label: 'Oat Milk', price: 20 },
        { id: 'coconut', label: 'Coconut Milk', price: 20 },
      ],
    },
    {
      id: 'addons',
      name: 'Add-ons',
      options: [
        { id: 'shot', label: 'Extra Shot', price: 15 },
        { id: 'whipped', label: 'Whipped Cream', price: 10 },
        { id: 'caramel', label: 'Caramel Drizzle', price: 15 },
        { id: 'vanilla', label: 'Vanilla Syrup', price: 15 },
      ],
    },
  ]

  const handleOptionSelect = (optionGroupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionGroupId]: optionId,
    }))
  }

  const calculateTotal = () => {
    let total = parseFloat(product.price)
    Object.entries(selectedOptions).forEach(([groupId, optionId]) => {
      const group = customizationOptions.find((g) => g.id === groupId)
      if (group) {
        const option = group.options.find((o) => o.id === optionId)
        if (option) {
          total += option.price
        }
      }
    })
    return total * quantity
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    navigate('/dashboard')
  }

  return (
    <div className="w-full h-lvh bg-slate-900 flex overflow-hidden">
      {/* Left - Product Image & Details */}
      <div className="w-1/2 flex flex-col p-6 border-r border-slate-700 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Product Image */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center mb-6 min-h-64">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-7xl">☕</div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
          <p className="text-slate-400 text-sm mb-4 line-clamp-3">{product.description}</p>
          <div className="flex items-center justify-between">
            <p className="text-slate-400">Stock: {product.stockQuantity}</p>
            <p className="text-3xl font-bold text-blue-400">₱{parseFloat(product.price).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Right - Customization Options */}
      <div className="w-1/2 flex flex-col p-6 overflow-hidden bg-slate-850">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Customize Your Order</h2>
          <p className="text-slate-400 text-sm">Select your preferences for {product.name}</p>
        </div>

        {/* Customization Options - Scrollable */}
        <div className="space-y-6 flex-1 overflow-y-auto mb-6 pr-3">
          {customizationOptions.map((group) => (
            <div key={group.id}>
              <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">{group.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(group.id, option.id)}
                    className={`
                      px-3 py-3 rounded-lg border-2 transition-all duration-200
                      text-sm font-medium text-left
                      ${
                        selectedOptions[group.id] === option.id
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <div>{option.label}</div>
                    {option.price > 0 && <div className="text-xs mt-1 opacity-80">+₱{option.price}</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section - Quantity, Total, Button */}
        <div className="border-t border-slate-700 pt-4 space-y-4">
          {/* Quantity Selector */}
          <div>
            <p className="text-slate-400 text-sm mb-2">Quantity</p>
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-2 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-lg font-bold text-white w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Total & Button */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700">
              <span className="text-slate-400">Total</span>
              <p className="text-2xl font-bold text-blue-400">₱{calculateTotal().toFixed(2)}</p>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
