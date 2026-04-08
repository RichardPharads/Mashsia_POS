/**
 * ═══════════════════════════════════════════════════════════════
 *  POS Terminal - Type Definitions
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// USER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'manager' | 'cashier' | 'supervisor'

export interface User {
  id: string
  name: string
  email?: string
  role: UserRole
  isActive: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  terminal_id?: string
  session_id?: string
  isAuthenticated: boolean
  isLoading: boolean
  error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT & CATEGORY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type InventoryReason = 'sale' | 'restock' | 'manual_adjustment' | 'void_return' | 'damage' | 'initial_stock'

export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  categoryId?: string
  name: string
  description?: string
  sku?: string
  barcode?: string
  price: string
  cost?: string
  vatInclusive: boolean
  stockQuantity: number
  lowStockThreshold: number
  trackStock: boolean
  imageUrl?: string
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  tags?: string[]
  allergens?: string[]
  createdAt: string
  updatedAt: string
  backgroundColor?: string // Added to support customizable background colors
  category?: string // Added to support category-based icons
  itemCount?: number // Added to display the number of items
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  customizations?: string[]
  notes?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'void' | 'refunded'
export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card' | 'dragonpay'
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'
export type DiscountType = 'senior' | 'pwd' | 'employee' | 'promo' | 'custom'

export interface OrderItem {
  id: string
  orderId: string
  productId?: string
  productName: string
  productSku?: string
  quantity: number
  unitPrice: string
  totalPrice: string
  vatAmount: string
  notes?: string
  createdAt: string
}

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: string
  cashReceived?: string
  changeGiven?: string
  referenceNumber?: string
  confirmedAt?: string
  createdAt: string
}

export interface Order {
  id: string
  sessionId?: string
  terminalId?: string
  cashierId?: string
  status: OrderStatus
  orderNumber: number
  subtotal: string
  vatableAmount: string
  vatExemptAmount: string
  vatAmount: string
  discountAmount: string
  discountType?: DiscountType
  total: string
  voidedAt?: string
  voidedBy?: string
  voidReason?: string
  source: 'pos' | 'kiosk'
  customerName?: string
  notes?: string
  items?: OrderItem[]
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SessionStatus = 'active' | 'closed'

export interface CashierSession {
  id: string
  cashierId: string
  terminalId: string
  status: SessionStatus
  timeIn: string
  timeOut?: string
  openingCash: string
  closingCash?: string
  expectedCash?: string
  cashVariance?: string
  totalTransactions: number
  totalSales: string
  totalVoids: number
  notes?: string
  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// TERMINAL TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TerminalType = 'pos' | 'kiosk'

export interface Terminal {
  id: string
  name: string
  type: TerminalType
  isActive: boolean
  macAddress?: string
  lastSeenAt?: string
  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─────────────────────────────────────────────────────────────────────────────
// BRANCH SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export interface BranchSettings {
  id: string
  businessName: string
  tin: string
  address: string
  vatRegistered: boolean
  vatRate: string
  currencySymbol: string
  orPrefix: string
  orSequence: number
  receiptFooter?: string
  logoUrl?: string
  timezone: string
  createdAt: string
  updatedAt: string
}
