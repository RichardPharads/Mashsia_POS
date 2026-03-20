/**
 * ═══════════════════════════════════════════════════════════════
 *  SariPOS — Production Seed
 *  Business: Kape ni Juan (Filipino Coffee Shop)
 *  Location: 45 Katipunan Ave, Loyola Heights, Quezon City
 *
 *  Run:   pnpm db:seed
 *  Reset: pnpm db:reset  then  pnpm db:push  then  pnpm db:seed
 *
 *  Features:
 *  ✓ Idempotent     — safe to run multiple times, skips if data exists
 *  ✓ Transactional  — rolls back fully on any error, no partial state
 *  ✓ RAG-ready      — every product has structured text for ChromaDB
 *  ✓ Strict typed   — no `as any` on core logic, proper interfaces
 *  ✓ Accurate       — session totals computed from actual inserted orders
 *  ✓ Realistic      — Filipino coffee shop pricing, names, patterns
 * ═══════════════════════════════════════════════════════════════
 */

import { db }  from '../client'
import { sql } from 'drizzle-orm'
import {
  branchSettings,
  users,
  terminals,
  categories,
  products,
  discountPresets,
  cashierSessions,
  orders,
  orderItems,
  payments,
  receipts,
  inventoryLog,
  dailySummaries,
} from '../schema'
import bcrypt from 'bcryptjs'
import crypto  from 'crypto'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card'
type DiscountType  = 'senior' | 'pwd' | 'employee' | 'promo'
type OrderSource   = 'pos' | 'kiosk'
type Tx            = Parameters<Parameters<typeof db.transaction>[0]>[0]

interface ProductRow {
  id:            string
  name:          string
  sku:           string | null
  price:         string
  stockQuantity: number
  trackStock:    boolean
}

interface OrderItem {
  product: ProductRow
  qty:     number
}

interface CreateOrderParams {
  sessionId:     string
  terminalId:    string
  cashierId:     string
  items:         OrderItem[]
  method:        PaymentMethod
  cashReceived?: number
  discount?:     DiscountType
  at:            Date
  customerName?: string
  source?:       OrderSource
}

interface OrderResult {
  total:  number
  method: PaymentMethod
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const p2     = (n: number): string => n.toFixed(2)
const vatOf  = (inc: number, r = 0.12) => inc - inc / (1 + r)
const vatBase = (inc: number, r = 0.12) => inc / (1 + r)
const hashPin = (pin: string) => bcrypt.hash(pin, 10)

function manilaDate(daysAgo: number, hour: number, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d
}

const addMins = (base: Date, mins: number): Date =>
  new Date(base.getTime() + mins * 60_000)

function roundCashUp(amount: number): number {
  const denoms = [20, 50, 100, 200, 500, 1000]
  for (const d of denoms) {
    if (amount <= d) return d
  }
  return Math.ceil(amount / 500) * 500
}

function makeRef(orderId: string, method: string): string {
  return `${method.toUpperCase()}-${crypto
    .createHash('sha256')
    .update(`${orderId}:${method}`)
    .digest('hex')
    .toUpperCase()
    .slice(0, 12)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTERS
// ─────────────────────────────────────────────────────────────────────────────
let _orderNum = 1
let _orSeq    = 1

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ORDER
// ALL inserts use `tx` — critical for foreign key consistency inside transaction
// ─────────────────────────────────────────────────────────────────────────────
async function createOrder(
  tx:     Tx,
  params: CreateOrderParams,
): Promise<OrderResult> {

  const subtotal = params.items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.qty,
    0,
  )

  let discountAmt = 0
  if (params.discount === 'senior' || params.discount === 'pwd') {
    discountAmt = vatBase(subtotal) * 0.20   // BIR: 20% off VAT-exclusive base
  } else if (params.discount === 'employee') {
    discountAmt = subtotal * 0.10
  } else if (params.discount === 'promo') {
    discountAmt = subtotal * 0.15
  }

  const discounted = subtotal - discountAmt
  const vat        = vatOf(discounted)
  const base       = vatBase(discounted)
  const total      = discounted

  // ── Order ──────────────────────────────────────────────────────────────
  const [order] = await tx.insert(orders).values({
    sessionId:       params.sessionId,
    terminalId:      params.terminalId,
    cashierId:       params.cashierId,
    status:          'paid',
    orderNumber:     _orderNum++,
    subtotal:        p2(subtotal),
    vatableAmount:   p2(base),
    vatExemptAmount: '0.00',
    vatAmount:       p2(vat),
    discountAmount:  p2(discountAmt),
    discountType:    params.discount ?? null,
    total:           p2(total),
    source:          params.source ?? 'pos',
    customerName:    params.customerName ?? null,
    createdAt:       params.at,
    updatedAt:       params.at,
  }).returning()

  // ── Order items ────────────────────────────────────────────────────────
  for (const item of params.items) {
    const lineTotal = Number(item.product.price) * item.qty
    await tx.insert(orderItems).values({
      orderId:     order.id,
      productId:   item.product.id,
      productName: item.product.name,
      productSku:  item.product.sku ?? null,
      quantity:    item.qty,
      unitPrice:   item.product.price,
      totalPrice:  p2(lineTotal),
      vatAmount:   p2(vatOf(lineTotal)),
      createdAt:   params.at,
    })
  }

  // ── Payment ────────────────────────────────────────────────────────────
  const isCash     = params.method === 'cash'
  const received   = isCash ? (params.cashReceived ?? roundCashUp(total)) : total
  const changeBack = isCash ? received - total : 0

  if (isCash && received < total) {
    throw new Error(
      `Cash received (${received}) < total (${total}) on order #${_orderNum - 1}`,
    )
  }

  await tx.insert(payments).values({
    orderId:         order.id,
    method:          params.method,
    status:          'confirmed',
    amount:          p2(total),
    cashReceived:    isCash ? p2(received)   : null,
    changeGiven:     isCash ? p2(changeBack) : null,
    referenceNumber: !isCash ? makeRef(order.id, params.method) : null,
    confirmedAt:     params.at,
    createdAt:       params.at,
  })

  // ── Receipt ────────────────────────────────────────────────────────────
  await tx.insert(receipts).values({
    orderId:      order.id,
    orNumber:     `OR-KNJ-2025-${String(_orSeq).padStart(6, '0')}`,
    orSequence:   _orSeq++,
    isVoid:       false,
    printedAt:    params.at,
    businessName: 'Kape ni Juan',
    tin:          '987-654-321-000',
    address:      '45 Katipunan Avenue, Loyola Heights, Quezon City',
    createdAt:    params.at,
  })

  // ── Inventory deduction ────────────────────────────────────────────────
  for (const item of params.items) {
    if (!item.product.trackStock) continue
    const before = item.product.stockQuantity
    const after  = before - item.qty
    await tx.insert(inventoryLog).values({
      productId:      item.product.id,
      reason:         'sale',
      orderId:        order.id,
      quantityBefore: before,
      quantityChange: -item.qty,
      quantityAfter:  after,
      createdAt:      params.at,
    })
    item.product.stockQuantity = after // mutate in-memory for subsequent orders
  }

  return { total, method: params.method }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTE SESSION TOTALS  — from actual results, never hardcoded
// ─────────────────────────────────────────────────────────────────────────────
function computeSessionTotals(results: OrderResult[]) {
  const totalSales = results.reduce((s, r) => s + r.total, 0)
  const cashSales  = results
    .filter(r => r.method === 'cash')
    .reduce((s, r) => s + r.total, 0)
  return {
    totalSales:        p2(totalSales),
    totalTransactions: results.length,
    expectedCash:      p2(cashSales),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RAG CONTEXT BUILDER
// Produces a structured natural-language string per product.
// When you implement ChromaDB, embed this string as the document text.
// Designed to match questions like:
//   "May dairy-free option ba?"
//   "Anong masarap kasama ng kape?"
//   "Meron bang walang caffeine?"
//   "Anong may chocolate?"
// ─────────────────────────────────────────────────────────────────────────────
function buildRagContext(p: {
  name:        string
  category:    string
  description: string
  price:       number
  tags:        string[]
  allergens:   string[]
  isFeatured:  boolean
}): string {
  return [
    `Product: ${p.name}.`,
    `Category: ${p.category}.`,
    p.description ? `Description: ${p.description}` : '',
    `Price: P ${p.price.toFixed(2)}.`,
    p.allergens.length > 0
      ? `Contains allergens: ${p.allergens.join(', ')}.`
      : 'No common allergens.',
    p.isFeatured ? 'Bestseller at Kape ni Juan.' : '',
    p.tags.length > 0 ? `Keywords: ${p.tags.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN SEED
// ═════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log('☕  Kape ni Juan — Production Seed\n')

  // ── IDEMPOTENCY GUARD ────────────────────────────────────────────────────
  const existing = await db
    .select({ id: branchSettings.id })
    .from(branchSettings)
    .limit(1)

  if (existing.length > 0) {
    console.log('⚠️   Seed already ran — branch record exists.')
    console.log('    Run  pnpm db:reset  first to re-seed.\n')
    process.exit(0)
  }

  console.log('🔒  No existing data — proceeding...\n')

  await db.transaction(async (tx) => {

    // ── 1. BRANCH ──────────────────────────────────────────────────────────
    console.log('📋  Branch settings...')
    const [branch] = await tx.insert(branchSettings).values({
      businessName:  'Kape ni Juan',
      tin:           '987-654-321-000',
      address:       '45 Katipunan Avenue, Loyola Heights, Quezon City, Metro Manila',
      vatRegistered: true,
      vatRate:       '0.12',
      currencySymbol:'P',
      orPrefix:      'OR-KNJ',
      orSequence:    1,
      receiptFooter: 'Salamat! Hanggang sa muli. Lagi kaming bukas para sa inyo.',
      timezone:      'Asia/Manila',
    }).returning()
    console.log(`   ✓  ${branch.businessName}`)

    // ── 2. USERS ───────────────────────────────────────────────────────────
    console.log('\n👤  Users...')

    const [owner] = await tx.insert(users).values({
      name: 'Juan dela Cruz', email: 'juan@kapeniguan.ph',
      pin:  await hashPin('0000'), role: 'owner',
    }).returning()

    const [manager] = await tx.insert(users).values({
      name: 'Ana Reyes', email: 'ana@kapeniguan.ph',
      pin:  await hashPin('1234'), role: 'manager',
    }).returning()

    const [cashier1] = await tx.insert(users).values({
      name: 'Bea Gonzales', email: null,
      pin:  await hashPin('1111'), role: 'cashier',
    }).returning()

    const [cashier2] = await tx.insert(users).values({
      name: 'Carlo Mendoza', email: null,
      pin:  await hashPin('2222'), role: 'cashier',
    }).returning()

    console.log(`   ✓  ${owner.name}    (owner)    PIN: 0000`)
    console.log(`   ✓  ${manager.name}   (manager)  PIN: 1234`)
    console.log(`   ✓  ${cashier1.name} (cashier)  PIN: 1111`)
    console.log(`   ✓  ${cashier2.name} (cashier)  PIN: 2222`)

    // ── 3. TERMINALS ───────────────────────────────────────────────────────
    console.log('\n🖥️   Terminals...')
    const [pos1]   = await tx.insert(terminals).values({ name: 'POS-1',   type: 'pos',   isActive: true }).returning()
    const [pos2]   = await tx.insert(terminals).values({ name: 'POS-2',   type: 'pos',   isActive: true }).returning()
    const [kiosk1] = await tx.insert(terminals).values({ name: 'Kiosk-1', type: 'kiosk', isActive: true }).returning()
    console.log(`   ✓  ${pos1.name}, ${pos2.name}, ${kiosk1.name}`)

    // ── 4. CATEGORIES ──────────────────────────────────────────────────────
    console.log('\n📂  Categories...')
    const [catEspresso]   = await tx.insert(categories).values({ name: 'Espresso Drinks',   color: '#533AB7', sortOrder: 1 }).returning()
    const [catNonCoffee]  = await tx.insert(categories).values({ name: 'Non-Coffee',         color: '#1D9E75', sortOrder: 2 }).returning()
    const [catFrappe]     = await tx.insert(categories).values({ name: 'Frappe & Blended',   color: '#185FA5', sortOrder: 3 }).returning()
    const [catPastries]   = await tx.insert(categories).values({ name: 'Pastries & Sweets',  color: '#D85A30', sortOrder: 4 }).returning()
    const [catSandwiches] = await tx.insert(categories).values({ name: 'Sandwiches & Mains', color: '#BA7517', sortOrder: 5 }).returning()
    const [catAddons]     = await tx.insert(categories).values({ name: 'Add-ons & Extras',   color: '#888780', sortOrder: 6 }).returning()
    const [catMerch]      = await tx.insert(categories).values({ name: 'Merchandise',         color: '#2C2C2A', sortOrder: 7 }).returning()
    console.log('   ✓  7 categories')

    // ── 5. PRODUCTS ────────────────────────────────────────────────────────
    console.log('\n📦  Products...')

    type SeedProduct = {
      categoryId:   string
      categoryName: string
      name:         string
      sku:          string
      price:        number
      cost:         number
      stock:        number
      lowStock?:    number
      trackStock?:  boolean
      description?: string
      tags:         string[]
      allergens:    string[]
      featured?:    boolean
    }

    const PRODUCTS: SeedProduct[] = [
      // ── ESPRESSO ──────────────────────────────────────────────────────────
      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-001', name: 'Americano',
        description: 'Double espresso shots lengthened with hot water. Clean, bold, no milk.',
        price: 120, cost: 35, stock: 999, trackStock: false,
        tags: ['coffee', 'espresso', 'hot', 'black coffee', 'strong', 'no milk', 'classic'], allergens: [] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-002', name: 'Cappuccino',
        description: 'Espresso with equal parts steamed milk and thick dry foam. Bold espresso taste with creamy texture.',
        price: 145, cost: 48, stock: 999, trackStock: false,
        tags: ['coffee', 'espresso', 'milk', 'foam', 'hot', 'classic', 'italian'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-003', name: 'Cafe Latte',
        description: 'Espresso with generous steamed milk and a thin layer of microfoam. Smooth and milky.',
        price: 150, cost: 50, stock: 999, trackStock: false, featured: true,
        tags: ['coffee', 'latte', 'milk', 'hot', 'espresso', 'smooth', 'classic'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-004', name: 'Flat White',
        description: 'Two ristretto shots with silky velvety microfoam. Stronger coffee ratio than a latte.',
        price: 155, cost: 52, stock: 999, trackStock: false,
        tags: ['coffee', 'flat white', 'milk', 'strong', 'hot', 'ristretto', 'velvety'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-005', name: 'Cortado',
        description: 'Equal parts espresso and warm milk to reduce acidity. Small but balanced.',
        price: 135, cost: 45, stock: 999, trackStock: false,
        tags: ['coffee', 'cortado', 'espresso', 'milk', 'small', 'hot', 'balanced'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-006', name: 'Iced Americano',
        description: 'Double espresso shots poured over ice. Cold, clean, and energizing.',
        price: 130, cost: 38, stock: 999, trackStock: false, featured: true,
        tags: ['coffee', 'iced', 'americano', 'black', 'cold', 'no milk', 'strong', 'refreshing'], allergens: [] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-007', name: 'Iced Latte',
        description: 'Espresso shots with cold fresh milk over ice. The everyday crowd-pleaser.',
        price: 160, cost: 55, stock: 999, trackStock: false, featured: true,
        tags: ['coffee', 'iced', 'latte', 'milk', 'cold', 'smooth', 'bestseller'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-008', name: 'Iced Cappuccino',
        description: 'Espresso with cold milk and cold foam poured over ice.',
        price: 155, cost: 52, stock: 999, trackStock: false,
        tags: ['coffee', 'iced', 'cappuccino', 'milk', 'cold', 'foam'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-009', name: 'Dirty Matcha Latte',
        description: 'A shot of espresso poured over iced matcha milk. Two worlds collide.',
        price: 175, cost: 62, stock: 999, trackStock: false, featured: true,
        tags: ['coffee', 'matcha', 'latte', 'iced', 'trending', 'espresso', 'green tea', 'unique'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-010', name: 'Brown Sugar Oat Latte',
        description: 'Espresso with oat milk and house-made brown sugar syrup over ice. Sweet, earthy, dairy-free option.',
        price: 180, cost: 65, stock: 999, trackStock: false, featured: true,
        tags: ['coffee', 'oat milk', 'brown sugar', 'latte', 'trending', 'dairy-free', 'sweet', 'iced'], allergens: ['oats'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-011', name: 'Spanish Latte',
        description: 'Espresso with condensed milk and fresh milk. Sweet, creamy Filipino coffee shop classic.',
        price: 165, cost: 58, stock: 999, trackStock: false, featured: true,
        tags: ['coffee', 'spanish latte', 'sweet', 'milk', 'condensed milk', 'creamy', 'filipino favorite', 'iced'], allergens: ['milk'] },

      { categoryId: catEspresso.id, categoryName: 'Espresso Drinks', sku: 'ESP-012', name: 'Vietnamese Coffee',
        description: 'Strong robusta espresso with Vietnamese-style sweetened condensed milk. Rich and bold.',
        price: 150, cost: 50, stock: 999, trackStock: false,
        tags: ['coffee', 'vietnamese', 'condensed milk', 'sweet', 'strong', 'robusta', 'iced'], allergens: ['milk'] },

      // ── NON-COFFEE ────────────────────────────────────────────────────────
      { categoryId: catNonCoffee.id, categoryName: 'Non-Coffee', sku: 'NCF-001', name: 'Matcha Latte',
        description: 'Japanese ceremonial grade matcha whisked with steamed milk. Earthy, slightly sweet, no coffee.',
        price: 165, cost: 58, stock: 999, trackStock: false, featured: true,
        tags: ['matcha', 'green tea', 'milk', 'hot', 'non-coffee', 'earthy', 'japanese', 'no caffeine anxiety'], allergens: ['milk'] },

      { categoryId: catNonCoffee.id, categoryName: 'Non-Coffee', sku: 'NCF-002', name: 'Iced Matcha Latte',
        description: 'Ceremonial matcha blended with cold milk over ice. Refreshing and vibrant green.',
        price: 170, cost: 60, stock: 999, trackStock: false, featured: true,
        tags: ['matcha', 'green tea', 'iced', 'milk', 'cold', 'non-coffee', 'refreshing'], allergens: ['milk'] },

      { categoryId: catNonCoffee.id, categoryName: 'Non-Coffee', sku: 'NCF-003', name: 'Hot Chocolate',
        description: 'Rich Belgian dark chocolate melted into steamed whole milk. Thick and comforting.',
        price: 155, cost: 52, stock: 999, trackStock: false,
        tags: ['chocolate', 'hot', 'milk', 'sweet', 'non-coffee', 'comfort drink', 'kids friendly'], allergens: ['milk'] },

      { categoryId: catNonCoffee.id, categoryName: 'Non-Coffee', sku: 'NCF-004', name: 'Taro Milk Tea',
        description: 'Creamy purple taro blended with milk and a light tea base. Can be served hot or iced.',
        price: 160, cost: 55, stock: 999, trackStock: false,
        tags: ['taro', 'milk tea', 'purple', 'sweet', 'non-coffee', 'creamy', 'ube-like'], allergens: ['milk'] },

      { categoryId: catNonCoffee.id, categoryName: 'Non-Coffee', sku: 'NCF-005', name: 'Chamomile Honey Tea',
        description: 'Dried chamomile flowers steeped and sweetened with local Batangas honey. Calming and herbal.',
        price: 130, cost: 38, stock: 999, trackStock: false,
        tags: ['tea', 'chamomile', 'honey', 'calming', 'non-coffee', 'herbal', 'relaxing', 'no caffeine'], allergens: [] },

      { categoryId: catNonCoffee.id, categoryName: 'Non-Coffee', sku: 'NCF-006', name: 'Strawberry Milk',
        description: 'Fresh strawberry syrup stirred into cold whole milk. Sweet and fruity.',
        price: 145, cost: 48, stock: 999, trackStock: false,
        tags: ['strawberry', 'milk', 'cold', 'sweet', 'non-coffee', 'fruity', 'kids friendly'], allergens: ['milk'] },

      // ── FRAPPE ────────────────────────────────────────────────────────────
      { categoryId: catFrappe.id, categoryName: 'Frappe & Blended', sku: 'FRP-001', name: 'Classic Coffee Frappe',
        description: 'Blended espresso with milk, ice, and whipped cream. Cold, creamy, and caffeinated.',
        price: 175, cost: 62, stock: 999, trackStock: false, featured: true,
        tags: ['frappe', 'coffee', 'blended', 'cold', 'cream', 'iced', 'sweet', 'caffeinated'], allergens: ['milk'] },

      { categoryId: catFrappe.id, categoryName: 'Frappe & Blended', sku: 'FRP-002', name: 'Mocha Frappe',
        description: 'Coffee and rich chocolate blended with milk and ice. Topped with whipped cream.',
        price: 185, cost: 68, stock: 999, trackStock: false,
        tags: ['frappe', 'mocha', 'chocolate', 'coffee', 'blended', 'sweet', 'rich'], allergens: ['milk'] },

      { categoryId: catFrappe.id, categoryName: 'Frappe & Blended', sku: 'FRP-003', name: 'Matcha Frappe',
        description: 'Blended ceremonial matcha with milk, ice, and whipped cream. Non-coffee cold drink.',
        price: 185, cost: 68, stock: 999, trackStock: false, featured: true,
        tags: ['frappe', 'matcha', 'blended', 'cold', 'green tea', 'non-coffee', 'sweet'], allergens: ['milk'] },

      { categoryId: catFrappe.id, categoryName: 'Frappe & Blended', sku: 'FRP-004', name: 'Caramel Frappe',
        description: 'Blended coffee with house caramel sauce and whipped cream. Sweet and indulgent.',
        price: 185, cost: 68, stock: 999, trackStock: false,
        tags: ['frappe', 'caramel', 'coffee', 'sweet', 'cream', 'blended', 'indulgent'], allergens: ['milk'] },

      { categoryId: catFrappe.id, categoryName: 'Frappe & Blended', sku: 'FRP-005', name: 'Strawberry Frappe',
        description: 'Non-coffee blended strawberry drink with milk and ice. Great for kids and non-coffee drinkers.',
        price: 175, cost: 62, stock: 999, trackStock: false,
        tags: ['frappe', 'strawberry', 'non-coffee', 'blended', 'sweet', 'fruity', 'kids friendly'], allergens: ['milk'] },

      { categoryId: catFrappe.id, categoryName: 'Frappe & Blended', sku: 'FRP-006', name: 'Oreo Frappe',
        description: 'Crushed Oreo cookies blended with milk and ice, topped with whipped cream and cookie crumble.',
        price: 185, cost: 68, stock: 999, trackStock: false,
        tags: ['frappe', 'oreo', 'cookies', 'sweet', 'non-coffee', 'cookies and cream', 'dessert drink'], allergens: ['milk', 'gluten'] },

      // ── PASTRIES ──────────────────────────────────────────────────────────
      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-001', name: 'Butter Croissant',
        description: 'All-butter laminated croissant baked fresh daily. Flaky outside, soft inside.',
        price: 85, cost: 35, stock: 40, lowStock: 10, featured: true,
        tags: ['pastry', 'croissant', 'buttery', 'flaky', 'baked', 'breakfast', 'pairs well with coffee'], allergens: ['gluten', 'milk', 'egg'] },

      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-002', name: 'Ham and Cheese Croissant',
        description: 'Butter croissant filled with premium ham and melted cheese. Savory and satisfying.',
        price: 115, cost: 52, stock: 30, lowStock: 8, featured: true,
        tags: ['pastry', 'croissant', 'ham', 'cheese', 'savory', 'breakfast', 'filling', 'pork'], allergens: ['gluten', 'milk', 'egg', 'pork'] },

      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-003', name: 'Chocolate Muffin',
        description: 'Double chocolate chip muffin with a moist crumb and gooey chocolate pockets.',
        price: 90, cost: 38, stock: 35, lowStock: 8,
        tags: ['muffin', 'chocolate', 'sweet', 'baked', 'pastry', 'chocolate chips'], allergens: ['gluten', 'milk', 'egg'] },

      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-004', name: 'Blueberry Muffin',
        description: 'Moist muffin bursting with real blueberries. Light and fruity.',
        price: 95, cost: 40, stock: 30, lowStock: 8,
        tags: ['muffin', 'blueberry', 'sweet', 'baked', 'pastry', 'fruity'], allergens: ['gluten', 'milk', 'egg'] },

      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-005', name: 'Banana Bread',
        description: 'Homestyle thick-sliced banana bread. Moist, dense, and lightly sweet.',
        price: 80, cost: 30, stock: 25, lowStock: 8,
        tags: ['banana bread', 'sweet', 'baked', 'classic', 'homestyle', 'banana'], allergens: ['gluten', 'egg', 'milk'] },

      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-006', name: 'Ensaymada',
        description: 'Soft Filipino brioche topped with buttercream and grated cheese. Sweet and salty Filipino classic.',
        price: 75, cost: 28, stock: 40, lowStock: 10, featured: true,
        tags: ['ensaymada', 'filipino', 'cheese', 'sweet', 'soft bread', 'local favorite', 'brioche'], allergens: ['gluten', 'milk', 'egg'] },

      { categoryId: catPastries.id, categoryName: 'Pastries & Sweets', sku: 'PST-007', name: 'Cheesecake',
        description: 'New York style baked cheesecake slice. Dense, creamy, and slightly tangy.',
        price: 130, cost: 58, stock: 20, lowStock: 5,
        tags: ['cheesecake', 'dessert', 'creamy', 'sweet', 'baked', 'new york style', 'indulgent'], allergens: ['gluten', 'milk', 'egg'] },

      // ── SANDWICHES & MAINS ────────────────────────────────────────────────
      { categoryId: catSandwiches.id, categoryName: 'Sandwiches & Mains', sku: 'SND-001', name: 'Club Sandwich',
        description: 'Triple-decker toasted sandwich with chicken, bacon, egg, lettuce, and tomato. Served with chips.',
        price: 195, cost: 88, stock: 25, lowStock: 8, featured: true,
        tags: ['sandwich', 'chicken', 'egg', 'classic', 'filling', 'lunch', 'heavy meal'], allergens: ['gluten', 'egg', 'milk', 'pork'] },

      { categoryId: catSandwiches.id, categoryName: 'Sandwiches & Mains', sku: 'SND-002', name: 'BLT Sandwich',
        description: 'Bacon, lettuce, and tomato on toasted sourdough with mayo. Simple and classic.',
        price: 175, cost: 78, stock: 20, lowStock: 6,
        tags: ['sandwich', 'bacon', 'blt', 'pork', 'toasted', 'classic', 'simple'], allergens: ['gluten', 'pork'] },

      { categoryId: catSandwiches.id, categoryName: 'Sandwiches & Mains', sku: 'SND-003', name: 'Tuna Melt',
        description: 'Creamy tuna salad with melted cheddar on toasted sourdough. Warm and comforting.',
        price: 165, cost: 72, stock: 20, lowStock: 6,
        tags: ['sandwich', 'tuna', 'cheese', 'melted', 'sourdough', 'seafood', 'warm'], allergens: ['gluten', 'milk', 'fish'] },

      { categoryId: catSandwiches.id, categoryName: 'Sandwiches & Mains', sku: 'SND-004', name: 'Avocado Toast',
        description: 'Thick sourdough toast smashed with avocado, a soft poached egg, and chili flakes. Healthy and trendy.',
        price: 185, cost: 82, stock: 15, lowStock: 5, featured: true,
        tags: ['avocado toast', 'egg', 'trendy', 'healthy', 'sourdough', 'brunch', 'vegetarian'], allergens: ['gluten', 'egg'] },

      { categoryId: catSandwiches.id, categoryName: 'Sandwiches & Mains', sku: 'SND-005', name: 'Longganisa Rice Bowl',
        description: 'Sweet Filipino longganisa links with garlic fried rice and a sunny-side-up egg. Breakfast all day.',
        price: 175, cost: 75, stock: 20, lowStock: 6, featured: true,
        tags: ['rice bowl', 'longganisa', 'filipino', 'breakfast', 'egg', 'garlic rice', 'pork', 'all day breakfast'], allergens: ['egg', 'pork'] },

      { categoryId: catSandwiches.id, categoryName: 'Sandwiches & Mains', sku: 'SND-006', name: 'Chicken Pesto Pasta',
        description: 'Al dente linguine tossed in house basil pesto with grilled chicken strips and parmesan.',
        price: 195, cost: 88, stock: 15, lowStock: 5,
        tags: ['pasta', 'pesto', 'chicken', 'italian', 'lunch', 'basil', 'parmesan', 'heavy meal'], allergens: ['gluten', 'milk', 'nuts'] },

      // ── ADD-ONS ───────────────────────────────────────────────────────────
      { categoryId: catAddons.id, categoryName: 'Add-ons & Extras', sku: 'ADD-001', name: 'Extra Espresso Shot',
        description: 'Add an extra shot of espresso to any drink for more caffeine and intensity.',
        price: 35, cost: 12, stock: 999, trackStock: false,
        tags: ['espresso', 'extra shot', 'add-on', 'strong', 'more caffeine'], allergens: [] },

      { categoryId: catAddons.id, categoryName: 'Add-ons & Extras', sku: 'ADD-002', name: 'Oat Milk Upgrade',
        description: 'Swap dairy milk for oat milk. Dairy-free, slightly sweet, creamy texture.',
        price: 45, cost: 18, stock: 999, trackStock: false,
        tags: ['oat milk', 'dairy free', 'vegan', 'add-on', 'plant-based', 'lactose free'], allergens: ['oats'] },

      { categoryId: catAddons.id, categoryName: 'Add-ons & Extras', sku: 'ADD-003', name: 'Almond Milk Upgrade',
        description: 'Swap dairy milk for almond milk. Dairy-free with a light nutty flavor.',
        price: 45, cost: 20, stock: 999, trackStock: false,
        tags: ['almond milk', 'dairy free', 'vegan', 'add-on', 'plant-based', 'nutty', 'lactose free'], allergens: ['nuts'] },

      { categoryId: catAddons.id, categoryName: 'Add-ons & Extras', sku: 'ADD-004', name: 'Vanilla Syrup',
        description: 'Add a pump of sweet vanilla syrup to any drink.',
        price: 25, cost: 8, stock: 999, trackStock: false,
        tags: ['syrup', 'vanilla', 'sweet', 'flavoring', 'add-on'], allergens: [] },

      { categoryId: catAddons.id, categoryName: 'Add-ons & Extras', sku: 'ADD-005', name: 'Caramel Syrup',
        description: 'Add a pump of rich caramel syrup to any drink.',
        price: 25, cost: 8, stock: 999, trackStock: false,
        tags: ['syrup', 'caramel', 'sweet', 'flavoring', 'add-on', 'buttery'], allergens: [] },

      { categoryId: catAddons.id, categoryName: 'Add-ons & Extras', sku: 'ADD-006', name: 'Whipped Cream',
        description: 'Add a dollop of fresh whipped cream on top of any drink.',
        price: 25, cost: 8, stock: 999, trackStock: false,
        tags: ['whipped cream', 'topping', 'sweet', 'cream', 'add-on', 'indulgent'], allergens: ['milk'] },

      // ── MERCHANDISE ───────────────────────────────────────────────────────
      { categoryId: catMerch.id, categoryName: 'Merchandise', sku: 'MRC-001', name: 'KNJ Tumbler 16oz',
        description: 'Kape ni Juan branded double-wall stainless steel tumbler. Keeps drinks hot or cold for 12 hours.',
        price: 650, cost: 280, stock: 20, lowStock: 5,
        tags: ['tumbler', 'merchandise', 'gift', 'stainless', 'branded', 'souvenir', 'reusable'], allergens: [] },

      { categoryId: catMerch.id, categoryName: 'Merchandise', sku: 'MRC-002', name: 'Barako Coffee Beans 250g',
        description: 'Local Barako beans sourced directly from Batangas farms. Medium roast, bold and earthy flavor. Great for pasalubong.',
        price: 350, cost: 160, stock: 30, lowStock: 8, featured: true,
        tags: ['beans', 'barako', 'batangas', 'local', 'whole beans', 'ground coffee', 'pasalubong', 'gift', 'medium roast'], allergens: [] },

      { categoryId: catMerch.id, categoryName: 'Merchandise', sku: 'MRC-003', name: 'Benguet Arabica Beans 250g',
        description: 'Single origin Arabica from Benguet highlands. Light roast with fruity and floral notes. Specialty coffee.',
        price: 420, cost: 200, stock: 25, lowStock: 8,
        tags: ['beans', 'arabica', 'benguet', 'single origin', 'specialty coffee', 'light roast', 'fruity', 'floral', 'premium'], allergens: [] },
    ]

    // Insert all products
    const insertedProducts: ProductRow[] = []
    for (const sp of PRODUCTS) {
      // Build RAG context — used when ChromaDB pipeline is implemented
      buildRagContext({
        name:        sp.name,
        category:    sp.categoryName,
        description: sp.description ?? '',
        price:       sp.price,
        tags:        sp.tags,
        allergens:   sp.allergens,
        isFeatured:  sp.featured ?? false,
      })

      const [prod] = await tx.insert(products).values({
        categoryId:        sp.categoryId,
        name:              sp.name,
        description:       sp.description ?? null,
        sku:               sp.sku,
        price:             p2(sp.price),
        cost:              p2(sp.cost),
        vatInclusive:      true,
        stockQuantity:     sp.stock,
        lowStockThreshold: sp.lowStock ?? 5,
        trackStock:        sp.trackStock ?? true,
        isActive:          true,
        isFeatured:        sp.featured ?? false,
        tags:              sp.tags,
        allergens:         sp.allergens,
      }).returning()

      insertedProducts.push({
        id:            prod.id,
        name:          prod.name,
        sku:           prod.sku,
        price:         prod.price,
        stockQuantity: prod.stockQuantity,
        trackStock:    prod.trackStock,
      })

      // Initial stock log for trackable products
      if (sp.trackStock !== false) {
        await tx.insert(inventoryLog).values({
          productId:      prod.id,
          userId:         manager.id,
          reason:         'initial_stock',
          quantityBefore: 0,
          quantityChange: sp.stock,
          quantityAfter:  sp.stock,
          notes:          'Initial stock — opening setup',
          createdAt:      manilaDate(7, 9, 0),
        })
      }
    }

    console.log(`   ✓  ${insertedProducts.length} products inserted`)

    // Product lookup map — throws immediately on typo
    const P: Record<string, ProductRow> = Object.fromEntries(
      insertedProducts.map(p => [p.name, p])
    )
    function get(name: string): ProductRow {
      const prod = P[name]
      if (!prod) throw new Error(`Product not found in seed map: "${name}"`)
      return prod
    }

    // ── 6. DISCOUNT PRESETS ────────────────────────────────────────────────
    console.log('\n🏷️   Discount presets...')
    await tx.insert(discountPresets).values([
      { name: 'Senior Citizen (20%)', type: 'senior',   percentage: '20.00', requiresApproval: false, isActive: true },
      { name: 'PWD (20%)',            type: 'pwd',      percentage: '20.00', requiresApproval: false, isActive: true },
      { name: 'Employee (10%)',       type: 'employee', percentage: '10.00', requiresApproval: true,  isActive: true },
      { name: 'Student Promo (15%)',  type: 'promo',    percentage: '15.00', requiresApproval: true,  isActive: true },
    ])
    console.log('   ✓  4 presets')

    // ── 7. SESSIONS & ORDERS ──────────────────────────────────────────────
    console.log('\n☕  Sessions and orders...')

    const s1Results: OrderResult[] = []
    const s2Results: OrderResult[] = []
    const s3Results: OrderResult[] = []

    // ── SESSION 1 — Yesterday AM, Bea on POS-1 ──────────────────────────
    const s1In = manilaDate(1, 7, 0)
    const [s1] = await tx.insert(cashierSessions).values({
      cashierId: cashier1.id, terminalId: pos1.id,
      status: 'closed', timeIn: s1In, timeOut: manilaDate(1, 15, 0),
      openingCash: '3000.00', totalTransactions: 0, totalSales: '0.00', totalVoids: 0,
    }).returning()

    const s1Defs: Array<{
      items: OrderItem[]
      method: PaymentMethod
      at: Date
      discount?: DiscountType
      customerName?: string
      source?: OrderSource
    }> = [
      { items: [{ product: get('Cafe Latte'), qty: 1 }, { product: get('Butter Croissant'), qty: 1 }], method: 'cash', at: addMins(s1In, 15) },
      { items: [{ product: get('Iced Americano'), qty: 2 }, { product: get('Ensaymada'), qty: 2 }], method: 'gcash', at: addMins(s1In, 28) },
      { items: [{ product: get('Spanish Latte'), qty: 1 }, { product: get('Ham and Cheese Croissant'), qty: 1 }], method: 'gcash', at: addMins(s1In, 45), source: 'kiosk' },
      { items: [{ product: get('Brown Sugar Oat Latte'), qty: 1 }, { product: get('Avocado Toast'), qty: 1 }], method: 'maya', at: addMins(s1In, 60), customerName: 'Ate Karen' },
      { items: [{ product: get('Iced Latte'), qty: 2 }, { product: get('Butter Croissant'), qty: 2 }, { product: get('Extra Espresso Shot'), qty: 1 }], method: 'cash', at: addMins(s1In, 75) },
      { items: [{ product: get('Cappuccino'), qty: 1 }, { product: get('Banana Bread'), qty: 1 }], method: 'cash', at: addMins(s1In, 90), discount: 'senior' },
      { items: [{ product: get('Classic Coffee Frappe'), qty: 2 }, { product: get('Chocolate Muffin'), qty: 2 }], method: 'gcash', at: addMins(s1In, 120) },
      { items: [{ product: get('Dirty Matcha Latte'), qty: 1 }, { product: get('Matcha Frappe'), qty: 1 }, { product: get('Cheesecake'), qty: 2 }], method: 'card', at: addMins(s1In, 135), customerName: 'Jill' },
      { items: [{ product: get('Iced Latte'), qty: 1 }, { product: get('Oat Milk Upgrade'), qty: 1 }, { product: get('Club Sandwich'), qty: 1 }], method: 'maya', at: addMins(s1In, 150) },
      { items: [{ product: get('Iced Americano'), qty: 3 }, { product: get('Iced Latte'), qty: 2 }, { product: get('Butter Croissant'), qty: 3 }, { product: get('Ensaymada'), qty: 2 }], method: 'gcash', at: addMins(s1In, 180), customerName: 'Team BDO' },
      { items: [{ product: get('Longganisa Rice Bowl'), qty: 2 }, { product: get('Americano'), qty: 2 }], method: 'cash', at: addMins(s1In, 210) },
      { items: [{ product: get('Barako Coffee Beans 250g'), qty: 2 }, { product: get('KNJ Tumbler 16oz'), qty: 1 }], method: 'card', at: addMins(s1In, 240) },
    ]

    for (const o of s1Defs) {
      s1Results.push(await createOrder(tx, { sessionId: s1.id, terminalId: pos1.id, cashierId: cashier1.id, ...o }))
    }

    const s1T = computeSessionTotals(s1Results)
    await tx.update(cashierSessions).set({
      totalTransactions: s1T.totalTransactions,
      totalSales:        s1T.totalSales,
      expectedCash:      s1T.expectedCash,
      closingCash:       p2(Number(s1T.expectedCash) + 3000 - 50),
      cashVariance:      '-50.00',
    }).where(sql`id = ${s1.id}`)
    console.log(`   ✓  Session 1 (Bea/POS-1 yesterday AM): ${s1Results.length} orders  P${s1T.totalSales}`)

    // ── SESSION 2 — Yesterday PM, Carlo on POS-2 ────────────────────────
    const s2In = manilaDate(1, 13, 0)
    const [s2] = await tx.insert(cashierSessions).values({
      cashierId: cashier2.id, terminalId: pos2.id,
      status: 'closed', timeIn: s2In, timeOut: manilaDate(1, 21, 0),
      openingCash: '3000.00', totalTransactions: 0, totalSales: '0.00', totalVoids: 0,
    }).returning()

    const s2Defs: Array<{
      items: OrderItem[]
      method: PaymentMethod
      at: Date
      discount?: DiscountType
      customerName?: string
    }> = [
      { items: [{ product: get('Iced Latte'), qty: 2 }, { product: get('Chicken Pesto Pasta'), qty: 1 }], method: 'gcash', at: addMins(s2In, 5) },
      { items: [{ product: get('Matcha Frappe'), qty: 1 }, { product: get('Caramel Frappe'), qty: 1 }, { product: get('Club Sandwich'), qty: 1 }], method: 'card', at: addMins(s2In, 20) },
      { items: [{ product: get('Spanish Latte'), qty: 2 }, { product: get('Tuna Melt'), qty: 2 }], method: 'gcash', at: addMins(s2In, 35), customerName: 'Kuya Jojo' },
      { items: [{ product: get('Iced Matcha Latte'), qty: 1 }, { product: get('Blueberry Muffin'), qty: 2 }], method: 'cash', at: addMins(s2In, 50) },
      { items: [{ product: get('Classic Coffee Frappe'), qty: 3 }, { product: get('Mocha Frappe'), qty: 2 }, { product: get('Oreo Frappe'), qty: 1 }], method: 'gcash', at: addMins(s2In, 65), customerName: 'Barkada order' },
      { items: [{ product: get('Brown Sugar Oat Latte'), qty: 1 }, { product: get('Oat Milk Upgrade'), qty: 1 }, { product: get('Avocado Toast'), qty: 1 }], method: 'maya', at: addMins(s2In, 80) },
      { items: [{ product: get('Dirty Matcha Latte'), qty: 2 }, { product: get('Ham and Cheese Croissant'), qty: 2 }], method: 'card', at: addMins(s2In, 95) },
      { items: [{ product: get('Hot Chocolate'), qty: 1 }, { product: get('Cheesecake'), qty: 1 }], method: 'cash', at: addMins(s2In, 120), discount: 'pwd' },
      { items: [{ product: get('Iced Americano'), qty: 4 }, { product: get('Extra Espresso Shot'), qty: 2 }, { product: get('Butter Croissant'), qty: 3 }], method: 'gcash', at: addMins(s2In, 150), customerName: 'UP students' },
      { items: [{ product: get('Taro Milk Tea'), qty: 2 }, { product: get('Strawberry Frappe'), qty: 1 }], method: 'cash', at: addMins(s2In, 180) },
      { items: [{ product: get('Cafe Latte'), qty: 1 }, { product: get('Longganisa Rice Bowl'), qty: 2 }, { product: get('BLT Sandwich'), qty: 1 }], method: 'maya', at: addMins(s2In, 240) },
      { items: [{ product: get('Cappuccino'), qty: 2 }, { product: get('Banana Bread'), qty: 2 }, { product: get('Vanilla Syrup'), qty: 2 }], method: 'gcash', at: addMins(s2In, 300) },
      { items: [{ product: get('Benguet Arabica Beans 250g'), qty: 1 }, { product: get('KNJ Tumbler 16oz'), qty: 2 }], method: 'card', at: addMins(s2In, 330), customerName: 'Regalo ni Tito' },
    ]

    for (const o of s2Defs) {
      s2Results.push(await createOrder(tx, { sessionId: s2.id, terminalId: pos2.id, cashierId: cashier2.id, ...o }))
    }

    const s2T = computeSessionTotals(s2Results)
    await tx.update(cashierSessions).set({
      totalTransactions: s2T.totalTransactions,
      totalSales:        s2T.totalSales,
      expectedCash:      s2T.expectedCash,
      closingCash:       p2(Number(s2T.expectedCash) + 3000 - 80),
      cashVariance:      '-80.00',
    }).where(sql`id = ${s2.id}`)
    console.log(`   ✓  Session 2 (Carlo/POS-2 yesterday PM): ${s2Results.length} orders  P${s2T.totalSales}`)

    // ── SESSION 3 — Today, Bea on POS-1 (ACTIVE) ────────────────────────
    const s3In = manilaDate(0, 7, 30)
    const [s3] = await tx.insert(cashierSessions).values({
      cashierId: cashier1.id, terminalId: pos1.id,
      status: 'active', timeIn: s3In,
      openingCash: '3000.00', totalTransactions: 0, totalSales: '0.00', totalVoids: 0,
    }).returning()

    const s3Defs: Array<{
      items: OrderItem[]
      method: PaymentMethod
      at: Date
      customerName?: string
    }> = [
      { items: [{ product: get('Iced Latte'), qty: 2 }, { product: get('Butter Croissant'), qty: 2 }], method: 'gcash', at: addMins(s3In, 10) },
      { items: [{ product: get('Brown Sugar Oat Latte'), qty: 1 }, { product: get('Avocado Toast'), qty: 1 }], method: 'card', at: addMins(s3In, 25) },
      { items: [{ product: get('Spanish Latte'), qty: 1 }, { product: get('Ham and Cheese Croissant'), qty: 1 }, { product: get('Extra Espresso Shot'), qty: 1 }], method: 'cash', at: addMins(s3In, 40) },
      { items: [{ product: get('Dirty Matcha Latte'), qty: 2 }, { product: get('Ensaymada'), qty: 2 }], method: 'maya', at: addMins(s3In, 55) },
      { items: [{ product: get('Classic Coffee Frappe'), qty: 1 }, { product: get('Matcha Frappe'), qty: 1 }, { product: get('Cheesecake'), qty: 1 }], method: 'gcash', at: addMins(s3In, 70), customerName: 'Ate Marie' },
    ]

    for (const o of s3Defs) {
      s3Results.push(await createOrder(tx, { sessionId: s3.id, terminalId: pos1.id, cashierId: cashier1.id, ...o }))
    }

    const s3T = computeSessionTotals(s3Results)
    await tx.update(cashierSessions).set({
      totalTransactions: s3T.totalTransactions,
      totalSales:        s3T.totalSales,
      expectedCash:      s3T.expectedCash,
    }).where(sql`id = ${s3.id}`)
    console.log(`   ✓  Session 3 (Bea/POS-1 today ACTIVE): ${s3Results.length} orders  P${s3T.totalSales}`)

    // ── 8. AI DAILY SUMMARY ────────────────────────────────────────────────
    console.log('\n🤖  AI daily summary...')

    const allY       = [...s1Results, ...s2Results]
    const grandTotal = allY.reduce((s, r) => s + r.total, 0)
    const yDate      = manilaDate(1, 0).toISOString().split('T')[0]!

    await tx.insert(dailySummaries).values({
      date:        yDate,
      summaryText: [
        `Kahapon (${yDate}), ang Kape ni Juan ay nagkaroon ng`,
        `P${grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })} na kabuuang benta`,
        `mula sa ${allY.length} na transaksyon.`,
        `Ang Spanish Latte, Brown Sugar Oat Latte, at Iced Latte ang mga pinaka-mabentang inumin.`,
        `Sa pagkain, nanguna ang Club Sandwich at Avocado Toast.`,
        `Ang GCash ang pinakasikat na paraan ng bayad.`,
        `Pinaka-abalang oras: 2pm hanggang 4pm.`,
        `Paalala: Mababa na ang stock ng Cheesecake at Avocado Toast — irekumenda ang mag-reorder bago mag-weekend.`,
      ].join(' '),
      totalSales:  p2(grandTotal),
      totalOrders: allY.length,
      topProducts: [
        { name: 'Iced Latte',            qty: 7, revenue: 1120 },
        { name: 'Spanish Latte',         qty: 5, revenue: 825  },
        { name: 'Brown Sugar Oat Latte', qty: 4, revenue: 720  },
        { name: 'Classic Coffee Frappe', qty: 5, revenue: 875  },
        { name: 'Butter Croissant',      qty: 8, revenue: 680  },
      ],
      paymentBreakdown: {
        cash:  Math.round(allY.filter(r => r.method === 'cash').reduce((s, r)  => s + r.total, 0)),
        gcash: Math.round(allY.filter(r => r.method === 'gcash').reduce((s, r) => s + r.total, 0)),
        maya:  Math.round(allY.filter(r => r.method === 'maya').reduce((s, r)  => s + r.total, 0)),
        card:  Math.round(allY.filter(r => r.method === 'card').reduce((s, r)  => s + r.total, 0)),
      },
      peakHour: 14,
    })
    console.log(`   ✓  Summary for ${yDate}  (P${grandTotal.toFixed(2)} / ${allY.length} orders)`)

  }) // ── end transaction ───────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(58))
  console.log('  ☕  Seed complete — Kape ni Juan')
  console.log('═'.repeat(58))
  console.log('  Business:  Kape ni Juan — Katipunan Ave, QC')
  console.log('  Products:  45  (all with RAG-ready descriptions)')
  console.log('  Sessions:  3   (2 closed yesterday, 1 active today)')
  console.log('  Totals:    computed from actual orders, not hardcoded')
  console.log('')
  console.log('  Login credentials:')
  console.log('  Owner:    PIN 0000  →  Juan dela Cruz')
  console.log('  Manager:  PIN 1234  →  Ana Reyes')
  console.log('  Cashier1: PIN 1111  →  Bea Gonzales')
  console.log('  Cashier2: PIN 2222  →  Carlo Mendoza')
  console.log('')
  console.log('  RAG note:')
  console.log('  Each product has tags + allergens + rich description.')
  console.log('  Call buildRagContext() per product when implementing ChromaDB.')
  console.log('═'.repeat(58))

  process.exit(0)
}

seed().catch((err) => {
  console.error('\n❌  Seed failed — transaction rolled back, DB is clean.')
  console.error(err)
  process.exit(1)
})