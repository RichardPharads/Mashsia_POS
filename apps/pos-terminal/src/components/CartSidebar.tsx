/**
 * ═══════════════════════════════════════════════════════════════
 *  Cart Sidebar Component - Shopping Cart Display & Checkout
 * ═══════════════════════════════════════════════════════════════
 */

import { usePOSStore } from '../store/posStore'
import { useState } from 'react'
import { apiService } from '../services/api'
import { useAuthStore } from '../store/authStore'
import ManagerControls from './ManagerControls'

export default function CartSidebar() {
  const { cart, removeFromCart, updateCartItem, clearCart } = usePOSStore()
  const { user, session_id, terminal_id } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'gcash'>('cash')

  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity
  }, 0)

  const vat = subtotal * 0.12
  const total = subtotal + vat

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsProcessing(true)
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
      }))

      await apiService.createOrder(
        session_id || '',
        terminal_id || '',
        user?.id || '',
        items,
        subtotal.toFixed(2),
        vat.toFixed(2),
        total.toFixed(2),
        paymentMethod
      )
      clearCart()
      // Show receipt or success message
      alert('Order created successfully!')
    } catch (error: any) {
      alert('Failed to create order: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-96 h-full bg-neutral-950 rounded-lg border border-neutral-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className=" from-slate-700 to-slate-600 px-4 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold text-lg">Customize</h2>
          <span className="text-slate-300 text-sm">{cart.length} items</span>
        </div>
        <p className="text-slate-400 text-xs">Customize Order</p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-slate-400 text-sm">Cart is empty</p>
              <p className="text-slate-500 text-xs mt-1">Add items to get started</p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-700/50 rounded-lg p-2 flex items-start justify-between gap-2 border border-slate-600/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm line-clamp-1">
                    {item.product.name}
                  </p>
                  <div className="bg-slate-600 px-2 py-0.5 rounded text-xs text-slate-300">●</div>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  ₱{parseFloat(item.product.price).toFixed(2)} × {item.quantity}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex gap-1 items-center ">
                <button
                  onClick={() => updateCartItem(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-5 h-5 flex items-center justify-center bg-slate-600 text-white rounded disabled:opacity-50 hover:bg-slate-500 text-xs font-bold"
                >
                  −
                </button>
                <span className="w-5 text-center text-white text-xs font-bold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateCartItem(item.id, item.quantity + 1)}
                  className="w-5 h-5 flex items-center justify-center bg-slate-600 text-white rounded hover:bg-slate-500 text-xs font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-5 h-5 flex items-center justify-center ml-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      {cart.length > 0 && (
        <>
          <div className="border-t border-slate-600 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>VAT (12%):</span>
              <span>₱{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-600">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="px-4 py-3 border-t border-slate-600">
            <label className="text-slate-300 text-xs font-bold uppercase mb-3 block">
              Payment Method
            </label>
            <div className="flex gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: '💵' },
                { id: 'gcash', label: 'GCash', icon: '📱' },
                { id: 'card', label: 'Card', icon: '💳' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`
                    flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    flex flex-col items-center gap-1
                    ${
                      paymentMethod === method.id
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }
                  `}
                >
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-xs">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-600 p-4 space-y-2">
            <button
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              className={`
                w-full py-3 rounded-lg font-bold
                transition-all duration-200 active:scale-95
                ${
                  isProcessing || cart.length === 0
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-slate-100'
                }
              `}
            >
              {isProcessing ? '🔄 Processing...' : 'Place order'}
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full px-4 py-2 rounded-lg border border-slate-500 text-slate-300 hover:bg-slate-700/50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Manager Controls - Only visible for managers */}
          <ManagerControls />
        </>
      )}
    </div>
  )
}
