/**
 * ═══════════════════════════════════════════════════════════════
 *  PIN Login Component - Modern POS Login Interface
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { apiService } from '../services/api'

export default function PINLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const pinInputRef = useRef<HTMLInputElement>(null)

  const { setUser, setSession, setError: setAuthError } = useAuthStore()

  useEffect(() => {
    pinInputRef.current?.focus()
  }, [])

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value)
      setError('')
    }
  }

  const handleNumberClick = (num: string) => {
    const newPin = pin + num
    handlePinChange(newPin)
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      triggerShake()
      return
    }

    setIsLoading(true)
    setAuthError(undefined)

    try {
      const result = await apiService.loginWithPIN(pin)
      if (result) {
        setUser(result.user)
        setSession(result.session_id, result.terminal_id)
        setPin('')
        setError('')
      } else {
        setError('Invalid PIN')
        triggerShake()
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    } else if (e.key === 'Backspace') {
      handleBackspace()
    } else if (/^\d$/.test(e.key)) {
      handleNumberClick(e.key)
    }
  }

  return (
    <div className="w-full h-lvh bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className={`
            bg-slate-800 rounded-2xl shadow-2xl p-8
            transition-transform duration-100
            ${shake ? 'animate-pulse' : ''}
          `}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">MASHSIA</h1>
            <p className="text-slate-400 text-sm uppercase tracking-widest">
              POS Terminal
            </p>
            <div className="mt-4 inline-block px-4 py-1 bg-green-500/20 rounded-full">
              <p className="text-green-400 text-xs font-semibold">Online</p>
            </div>
          </div>

          {/* PIN Display */}
          <div className="mb-8">
            <label className="block text-slate-300 text-xs font-semibold uppercase mb-3 tracking-widest">
              Enter PIN
            </label>
            <div
              className={`
                relative bg-slate-700 rounded-lg overflow-hidden
                transition-all duration-200
              `}
            >
              <input
                ref={pinInputRef}
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                maxLength={4}
                className={`
                  w-full px-6 py-4 bg-slate-700 text-white text-center
                  text-3xl font-bold tracking-widest
                  focus:outline-none transition-all duration-200
                  placeholder-slate-500
                  ${error ? 'ring-2 ring-red-500' : 'ring-1 ring-slate-600'}
                `}
              />
              {/* Security indicator dots */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`
                        w-3 h-3 rounded-full transition-all duration-200
                        ${
                          i < pin.length
                            ? 'bg-blue-400 shadow-lg shadow-blue-400/50'
                            : 'bg-slate-600'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Numberpad */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={isLoading}
                  className={`
                    py-4 rounded-lg font-bold text-lg
                    transition-all duration-150 transform
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      pin.length === 4
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                disabled={isLoading || pin.length === 0}
                className={`
                  py-4 rounded-lg font-bold text-sm
                  transition-all duration-150 transform
                  col-span-1 disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    pin.length === 0
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95'
                  }
                `}
              >
                Clear
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                disabled={isLoading}
                className={`
                  py-4 rounded-lg font-bold text-lg col-span-1
                  transition-all duration-150 transform
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    pin.length === 4
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
                  }
                `}
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={isLoading || pin.length === 0}
                className={`
                  py-4 rounded-lg font-bold text-sm
                  transition-all duration-150 transform
                  col-span-1 disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    pin.length === 0
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 active:scale-95'
                  }
                `}
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading || pin.length !== 4}
            className={`
              w-full py-4 rounded-lg font-bold text-lg
              transition-all duration-200 transform
              uppercase tracking-wider
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                pin.length === 4 && !isLoading
                  ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50 active:scale-95'
                  : 'bg-slate-700 text-slate-400'
              }
            `}
          >
            {isLoading ? '🔄 Logging in...' : 'Login'}
          </button>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-xs">
              🔒 Secure PIN Entry • Keyboard Support
            </p>
          </div>
        </div>

        {/* Terminal ID Display */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Terminal: <span className="text-slate-400 font-mono">POS-001</span>
          </p>
        </div>
      </div>
    </div>
  )
}
