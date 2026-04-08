/**
 * ═══════════════════════════════════════════════════════════════
 *  Manager Controls - Special actions for Managers only
 * ═══════════════════════════════════════════════════════════════
 */

import { useAuthStore } from '../store/authStore'
import { usePOSStore } from '../store/posStore'

export default function ManagerControls() {
  const { user } = useAuthStore()
  const { clearCart } = usePOSStore()

  // Only show for managers
  if (!user || user.role !== 'manager') {
    return null
  }

  const handleVoidTransaction = () => {
    if (confirm('Are you sure you want to void this transaction? This action cannot be undone.')) {
      clearCart()
      alert('Transaction voided successfully')
    }
  }

  const handleIssueResolution = () => {
    alert('Issue Resolution: Contact supervisor or use admin dashboard for adjustments')
  }

  return (
    <div className="mt-4 space-y-2 border-t border-slate-600 pt-4">
      <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">
        🔑 Manager Controls
      </h3>

      <button
        onClick={handleVoidTransaction}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        ⊘ Void Transaction
      </button>

      <button
        onClick={handleIssueResolution}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
      >
        ⚠ Issue Resolution
      </button>

      <p className="text-xs text-slate-400 mt-2">
        Managers have special access to handle exceptions and resolve issues
      </p>
    </div>
  )
}
