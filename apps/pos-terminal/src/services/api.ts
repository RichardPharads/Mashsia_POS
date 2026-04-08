/**
 * ═══════════════════════════════════════════════════════════════
 *  API Service - Tauri Rust Backend Integration
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core'
import { User, Product, Category, Order, ApiResponse } from '../types'

class APIService {
  /**
   * Login with PIN
   * Calls Rust backend via Tauri command
   */
  async loginWithPIN(pin: string): Promise<{ user: User; session_id: string; terminal_id: string } | null> {
    try {
      console.log('🔐 Starting login with PIN...')
      const response = await invoke<ApiResponse<{
        user: User
        session_id: string
        terminal_id: string
        token: string
      }>>('login_with_pin', { pin })

      console.log('✅ Login response:', response)

      if (response.success && response.data) {
        const { user, token, session_id, terminal_id } = response.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('session_id', session_id)
        localStorage.setItem('terminal_id', terminal_id)
        console.log('✅ Login successful:', user)
        return { user, session_id, terminal_id }
      }
      console.log('❌ Login not successful:', response)
      return null
    } catch (error) {
      console.error('❌ Login error:', error)
      throw new Error(typeof error === 'string' ? error : 'Failed to login')
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return null
      return null
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      return null
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('session_id')
      localStorage.removeItem('terminal_id')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await invoke<ApiResponse<Category[]>>('get_categories')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return []
    }
  }

  /**
   * Get all products
   */
  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      const response = await invoke<ApiResponse<Product[]>>('get_products', {
        category_id: categoryId,
      })
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return []
    }
  }

  /**
   * Get single product
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await invoke<ApiResponse<Product>>('get_product', { id })
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return null
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ORDER ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create order
   */
  async createOrder(
    sessionId: string,
    terminalId: string,
    cashierId: string,
    items: any[],
    subtotal: string,
    vat: string,
    total: string,
    paymentMethod: string
  ): Promise<{ orderId: string; orderNumber: string; total: string } | null> {
    try {
      const response = await invoke<ApiResponse<any>>('create_order', {
        session_id: sessionId,
        terminal_id: terminalId,
        cashier_id: cashierId,
        items,
        subtotal,
        vat,
        total,
        payment_method: paymentMethod,
      })

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Create order error:', error)
      throw new Error(typeof error === 'string' ? error : 'Failed to create order')
    }
  }

  /**
   * Get orders
   */
  async getOrders(sessionId?: string): Promise<Order[]> {
    try {
      const response = await invoke<ApiResponse<Order[]>>('get_orders', {
        session_id: sessionId,
      })
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return []
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MANAGER ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Void transaction (manager only)
   */
  async voidTransaction(sessionId: string, reason: string = ''): Promise<boolean> {
    try {
      const response = await invoke<ApiResponse<string>>('void_transaction', {
        session_id: sessionId,
        reason,
      })
      return response.success
    } catch (error) {
      console.error('Void transaction error:', error)
      return false
    }
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      const response = await invoke<ApiResponse<string>>('get_health')
      return response.success
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

export const apiService = new APIService()
