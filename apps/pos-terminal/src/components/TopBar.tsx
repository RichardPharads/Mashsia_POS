/**
 * ═══════════════════════════════════════════════════════════════
 *  Top Bar Component - User Info & Quick Actions
 * ═══════════════════════════════════════════════════════════════
 */

import { User } from '../types'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'

interface TopBarProps {
  user: User | null
}

export default function TopBar({ user }: TopBarProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await apiService.logout()
    logout()
    navigate('/login')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-400'
      case 'manager':
        return 'bg-blue-500/20 text-blue-400'
      case 'supervisor':
        return 'bg-amber-500/20 text-amber-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-white font-semibold text-sm">{user?.name || 'User'}</p>
          <p className={`text-xs font-medium px-2 py-1 rounded w-fit ${getRoleColor(user?.role || '')}`}>
            {user?.role.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="text-right">
          <p className="text-white font-mono text-sm">{new Date().toLocaleTimeString()}</p>
          <p className="text-slate-400 text-xs">{new Date().toLocaleDateString()}</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
            ml-4 px-4 py-2 rounded-lg
            bg-red-500/20 text-red-400 hover:bg-red-500/30
            text-sm font-medium transition-colors
            border border-red-500/30 hover:border-red-500/50
          "
        >
          Logout
        </button>
      </div>
    </div>
  )
}
