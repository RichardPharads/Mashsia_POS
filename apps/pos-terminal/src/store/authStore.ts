/**
 * ═══════════════════════════════════════════════════════════════
 *  Zustand Auth Store - User Authentication & Session Management
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand'
import { User, AuthState } from '../types'

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void
  setSession: (session_id: string, terminal_id: string) => void
  logout: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error?: string) => void
  reset: () => void
}

const initialState: AuthState = {
  user: null,
  terminal_id: undefined,
  session_id: undefined,
  isAuthenticated: false,
  isLoading: false,
  error: undefined,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
      error: undefined,
    }),

  setSession: (session_id: string, terminal_id: string) =>
    set({
      session_id,
      terminal_id,
    }),

  logout: () => set(initialState),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error?: string) => set({ error }),

  reset: () => set(initialState),
}))
