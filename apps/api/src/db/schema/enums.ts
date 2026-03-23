import { pgEnum } from 'drizzle-orm/pg-core'

// ── User roles ─────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'manager',
  'cashier',
  'supervisor',
])

// ── Terminal types ─────────────────────────────────────────────────────────
export const terminalTypeEnum = pgEnum('terminal_type', [
  'pos',
  'kiosk',
])

// ── Order status ───────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'void',
  'refunded',
])

// ── Payment methods ────────────────────────────────────────────────────────
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'gcash',
  'maya',
  'card',
  'dragonpay',
])

// ── Payment status ─────────────────────────────────────────────────────────
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'confirmed',
  'failed',
  'refunded',
])

// ── Discount types ─────────────────────────────────────────────────────────
export const discountTypeEnum = pgEnum('discount_type', [
  'senior',       // 20% RA 9994
  'pwd',          // 20% RA 7277
  'employee',
  'promo',
  'custom',
])

// ── Inventory movement reasons ─────────────────────────────────────────────
export const inventoryReasonEnum = pgEnum('inventory_reason', [
  'sale',
  'restock',
  'manual_adjustment',
  'void_return',
  'damage',
  'initial_stock',
])

// ── Audit action types ─────────────────────────────────────────────────────
export const auditActionEnum = pgEnum('audit_action', [
  'login',
  'logout',
  'order_void',
  'discount_applied',
  'product_price_change',
  'product_created',
  'product_deleted',
  'stock_adjusted',
  'cashier_created',
  'cashier_deactivated',
  'settings_changed',
  'z_reading',
  'x_reading',
])

// ── Session status ─────────────────────────────────────────────────────────
export const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'closed',
])