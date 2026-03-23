import {
    pgTable,
    uuid,
    text,
    varchar,
    numeric,
    integer,
    boolean,
    timestamp,
    jsonb,
    index,
    uniqueIndex,
  } from 'drizzle-orm/pg-core'
  import { relations } from 'drizzle-orm'
  import {
    userRoleEnum,
    terminalTypeEnum,
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
    discountTypeEnum,
    inventoryReasonEnum,
    auditActionEnum,
    sessionStatusEnum,
  } from './enums'
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 01. BRANCH SETTINGS
  // One row per branch. Stores BIR info and global config.
  // ─────────────────────────────────────────────────────────────────────────────
  export const branchSettings = pgTable('branch_settings', {
    id:               uuid('id').primaryKey().defaultRandom(),
    businessName:     text('business_name').notNull(),
    tin:              varchar('tin', { length: 20 }).notNull(),
    address:          text('address').notNull(),
    vatRegistered:    boolean('vat_registered').notNull().default(true),
    vatRate:          numeric('vat_rate', { precision: 5, scale: 4 })
                        .notNull().default('0.12'),
    currencySymbol:   varchar('currency_symbol', { length: 5 })
                        .notNull().default('P'),
    orPrefix:         varchar('or_prefix', { length: 20 })
                        .notNull().default('OR'),
    orSequence:       integer('or_sequence').notNull().default(1),
    receiptFooter:    text('receipt_footer'),
    logoUrl:          text('logo_url'),
    timezone:         varchar('timezone', { length: 50 })
                        .notNull().default('Asia/Manila'),
    createdAt:        timestamp('created_at', { withTimezone: true })
                        .notNull().defaultNow(),
    updatedAt:        timestamp('updated_at', { withTimezone: true })
                        .notNull().defaultNow(),
  })
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 02. USERS  (cashiers, managers, owner)
  // ─────────────────────────────────────────────────────────────────────────────
  export const users = pgTable('users', {
    id:           uuid('id').primaryKey().defaultRandom(),
    name:         text('name').notNull(),
    email:        varchar('email', { length: 255 }),
    pin:          varchar('pin', { length: 255 }).notNull(), // bcrypt hashed
    role:         userRoleEnum('role').notNull().default('cashier'),
    isActive:     boolean('is_active').notNull().default(true),
    avatarUrl:    text('avatar_url'),
    createdAt:    timestamp('created_at', { withTimezone: true })
                    .notNull().defaultNow(),
    updatedAt:    timestamp('updated_at', { withTimezone: true })
                    .notNull().defaultNow(),
  }, (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 03. TERMINALS  (POS-1, POS-2, Kiosk-1)
  // ─────────────────────────────────────────────────────────────────────────────
  export const terminals = pgTable('terminals', {
    id:           uuid('id').primaryKey().defaultRandom(),
    name:         varchar('name', { length: 50 }).notNull(), // POS-1, POS-2
    type:         terminalTypeEnum('type').notNull().default('pos'),
    isActive:     boolean('is_active').notNull().default(true),
    macAddress:   varchar('mac_address', { length: 20 }),    // optional hardware ID
    lastSeenAt:   timestamp('last_seen_at', { withTimezone: true }),
    createdAt:    timestamp('created_at', { withTimezone: true })
                    .notNull().defaultNow(),
  }, (t) => ({
    nameIdx: uniqueIndex('terminals_name_idx').on(t.name),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 04. CASHIER SESSIONS  (one row per cashier shift)
  // ─────────────────────────────────────────────────────────────────────────────
  export const cashierSessions = pgTable('cashier_sessions', {
    id:               uuid('id').primaryKey().defaultRandom(),
    cashierId:        uuid('cashier_id').notNull().references(() => users.id),
    terminalId:       uuid('terminal_id').notNull().references(() => terminals.id),
    status:           sessionStatusEnum('status').notNull().default('active'),
    timeIn:           timestamp('time_in', { withTimezone: true })
                        .notNull().defaultNow(),
    timeOut:          timestamp('time_out', { withTimezone: true }),
    openingCash:      numeric('opening_cash', { precision: 12, scale: 2 })
                        .notNull().default('0'),
    closingCash:      numeric('closing_cash', { precision: 12, scale: 2 }),
    expectedCash:     numeric('expected_cash', { precision: 12, scale: 2 }),
    cashVariance:     numeric('cash_variance', { precision: 12, scale: 2 }),
    totalTransactions: integer('total_transactions').notNull().default(0),
    totalSales:       numeric('total_sales', { precision: 12, scale: 2 })
                        .notNull().default('0'),
    totalVoids:       integer('total_voids').notNull().default(0),
    notes:            text('notes'),
    createdAt:        timestamp('created_at', { withTimezone: true })
                        .notNull().defaultNow(),
  }, (t) => ({
    cashierIdx:  index('sessions_cashier_idx').on(t.cashierId),
    terminalIdx: index('sessions_terminal_idx').on(t.terminalId),
    statusIdx:   index('sessions_status_idx').on(t.status),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 05. CATEGORIES  (Food, Drinks, Add-ons, etc.)
  // ─────────────────────────────────────────────────────────────────────────────
  export const categories = pgTable('categories', {
    id:           uuid('id').primaryKey().defaultRandom(),
    name:         varchar('name', { length: 100 }).notNull(),
    description:  text('description'),
    color:        varchar('color', { length: 7 }),    // hex color for UI
    sortOrder:    integer('sort_order').notNull().default(0),
    isActive:     boolean('is_active').notNull().default(true),
    createdAt:    timestamp('created_at', { withTimezone: true })
                    .notNull().defaultNow(),
    updatedAt:    timestamp('updated_at', { withTimezone: true })
                    .notNull().defaultNow(),
  })
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 06. PRODUCTS
  // ─────────────────────────────────────────────────────────────────────────────
  export const products = pgTable('products', {
    id:                 uuid('id').primaryKey().defaultRandom(),
    categoryId:         uuid('category_id').references(() => categories.id),
    name:               text('name').notNull(),
    description:        text('description'),
    sku:                varchar('sku', { length: 100 }),
    barcode:            varchar('barcode', { length: 100 }),
    price:              numeric('price', { precision: 12, scale: 2 }).notNull(),
    cost:               numeric('cost',  { precision: 12, scale: 2 }), // for margin calc
    vatInclusive:       boolean('vat_inclusive').notNull().default(true),
    stockQuantity:      integer('stock_quantity').notNull().default(0),
    lowStockThreshold:  integer('low_stock_threshold').notNull().default(10),
    trackStock:         boolean('track_stock').notNull().default(true),
    imageUrl:           text('image_url'),
    isActive:           boolean('is_active').notNull().default(true),
    isFeatured:         boolean('is_featured').notNull().default(false),
    sortOrder:          integer('sort_order').notNull().default(0),
    // AI embedding metadata
    embeddingUpdatedAt: timestamp('embedding_updated_at', { withTimezone: true }),
    tags:               text('tags').array(),         // for AI search context
    allergens:          text('allergens').array(),     // for cashier AI assistant
    createdAt:          timestamp('created_at', { withTimezone: true })
                          .notNull().defaultNow(),
    updatedAt:          timestamp('updated_at', { withTimezone: true })
                          .notNull().defaultNow(),
  }, (t) => ({
    categoryIdx:  index('products_category_idx').on(t.categoryId),
    barcodeIdx:   uniqueIndex('products_barcode_idx').on(t.barcode),
    skuIdx:       uniqueIndex('products_sku_idx').on(t.sku),
    activeIdx:    index('products_active_idx').on(t.isActive),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 07. INVENTORY LOG  (every stock movement)
  // ─────────────────────────────────────────────────────────────────────────────
  export const inventoryLog = pgTable('inventory_log', {
    id:             uuid('id').primaryKey().defaultRandom(),
    productId:      uuid('product_id').notNull().references(() => products.id),
    userId:         uuid('user_id').references(() => users.id),
    orderId:        uuid('order_id'),                 // set if reason = sale
    reason:         inventoryReasonEnum('reason').notNull(),
    quantityBefore: integer('quantity_before').notNull(),
    quantityChange: integer('quantity_change').notNull(), // negative = deduct
    quantityAfter:  integer('quantity_after').notNull(),
    notes:          text('notes'),
    createdAt:      timestamp('created_at', { withTimezone: true })
                      .notNull().defaultNow(),
  }, (t) => ({
    productIdx: index('inventory_product_idx').on(t.productId),
    createdIdx: index('inventory_created_idx').on(t.createdAt),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 08. ORDERS  (one per transaction)
  // ─────────────────────────────────────────────────────────────────────────────
  export const orders = pgTable('orders', {
    id:               uuid('id').primaryKey().defaultRandom(),
    sessionId:        uuid('session_id').references(() => cashierSessions.id),
    terminalId:       uuid('terminal_id').references(() => terminals.id),
    cashierId:        uuid('cashier_id').references(() => users.id),
    status:           orderStatusEnum('status').notNull().default('pending'),
    orderNumber:      integer('order_number').notNull(),  // sequential per day
    // Pricing breakdown
    subtotal:         numeric('subtotal',          { precision: 12, scale: 2 }).notNull(),
    vatableAmount:    numeric('vatable_amount',    { precision: 12, scale: 2 }).notNull(),
    vatExemptAmount:  numeric('vat_exempt_amount', { precision: 12, scale: 2 })
                        .notNull().default('0'),
    vatAmount:        numeric('vat_amount',        { precision: 12, scale: 2 }).notNull(),
    discountAmount:   numeric('discount_amount',   { precision: 12, scale: 2 })
                        .notNull().default('0'),
    discountType:     discountTypeEnum('discount_type'),
    discountApprovedBy: uuid('discount_approved_by').references(() => users.id),
    total:            numeric('total',             { precision: 12, scale: 2 }).notNull(),
    // Void info
    voidedAt:         timestamp('voided_at',       { withTimezone: true }),
    voidedBy:         uuid('voided_by').references(() => users.id),
    voidReason:       text('void_reason'),
    // Source
    source:           text('source').notNull().default('pos'), // pos | kiosk
    customerName:     text('customer_name'),
    notes:            text('notes'),
    createdAt:        timestamp('created_at', { withTimezone: true })
                        .notNull().defaultNow(),
    updatedAt:        timestamp('updated_at', { withTimezone: true })
                        .notNull().defaultNow(),
  }, (t) => ({
    sessionIdx:   index('orders_session_idx').on(t.sessionId),
    terminalIdx:  index('orders_terminal_idx').on(t.terminalId),
    cashierIdx:   index('orders_cashier_idx').on(t.cashierId),
    statusIdx:    index('orders_status_idx').on(t.status),
    createdIdx:   index('orders_created_idx').on(t.createdAt),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 09. ORDER ITEMS  (line items per order)
  // ─────────────────────────────────────────────────────────────────────────────
  export const orderItems = pgTable('order_items', {
    id:           uuid('id').primaryKey().defaultRandom(),
    orderId:      uuid('order_id').notNull().references(() => orders.id, {
                    onDelete: 'cascade'
                  }),
    productId:    uuid('product_id').references(() => products.id),
    // Snapshot at time of sale — product may change later
    productName:  text('product_name').notNull(),
    productSku:   varchar('product_sku', { length: 100 }),
    quantity:     integer('quantity').notNull(),
    unitPrice:    numeric('unit_price',  { precision: 12, scale: 2 }).notNull(),
    totalPrice:   numeric('total_price', { precision: 12, scale: 2 }).notNull(),
    vatAmount:    numeric('vat_amount',  { precision: 12, scale: 2 }).notNull(),
    notes:        text('notes'),
    createdAt:    timestamp('created_at', { withTimezone: true })
                    .notNull().defaultNow(),
  }, (t) => ({
    orderIdx:   index('order_items_order_idx').on(t.orderId),
    productIdx: index('order_items_product_idx').on(t.productId),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 10. PAYMENTS  (one order can have split payments)
  // ─────────────────────────────────────────────────────────────────────────────
  export const payments = pgTable('payments', {
    id:             uuid('id').primaryKey().defaultRandom(),
    orderId:        uuid('order_id').notNull().references(() => orders.id),
    method:         paymentMethodEnum('method').notNull(),
    status:         paymentStatusEnum('status').notNull().default('pending'),
    amount:         numeric('amount',       { precision: 12, scale: 2 }).notNull(),
    // Cash-specific
    cashReceived:   numeric('cash_received', { precision: 12, scale: 2 }),
    changeGiven:    numeric('change_given',  { precision: 12, scale: 2 }),
    // E-wallet / card specific
    referenceNumber: varchar('reference_number', { length: 100 }), // GCash ref, Maya ref
    gatewayResponse: jsonb('gateway_response'),                     // raw webhook payload
    confirmedAt:    timestamp('confirmed_at', { withTimezone: true }),
    createdAt:      timestamp('created_at',  { withTimezone: true })
                      .notNull().defaultNow(),
  }, (t) => ({
    orderIdx:  index('payments_order_idx').on(t.orderId),
    methodIdx: index('payments_method_idx').on(t.method),
    statusIdx: index('payments_status_idx').on(t.status),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 11. RECEIPTS  (BIR official receipt tracking)
  // ─────────────────────────────────────────────────────────────────────────────
  export const receipts = pgTable('receipts', {
    id:           uuid('id').primaryKey().defaultRandom(),
    orderId:      uuid('order_id').notNull().references(() => orders.id),
    orNumber:     varchar('or_number', { length: 50 }).notNull(), // e.g. OR-2025-000001
    orSequence:   integer('or_sequence').notNull(),
    isVoid:       boolean('is_void').notNull().default(false),
    printedAt:    timestamp('printed_at', { withTimezone: true }),
    reprintCount: integer('reprint_count').notNull().default(0),
    // Snapshot of BIR fields at time of printing
    businessName: text('business_name').notNull(),
    tin:          varchar('tin', { length: 20 }).notNull(),
    address:      text('address').notNull(),
    createdAt:    timestamp('created_at', { withTimezone: true })
                    .notNull().defaultNow(),
  }, (t) => ({
    orNumberIdx: uniqueIndex('receipts_or_number_idx').on(t.orNumber),
    orderIdx:    index('receipts_order_idx').on(t.orderId),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 12. DISCOUNT PRESETS
  // ─────────────────────────────────────────────────────────────────────────────
  export const discountPresets = pgTable('discount_presets', {
    id:               uuid('id').primaryKey().defaultRandom(),
    name:             varchar('name', { length: 100 }).notNull(),
    type:             discountTypeEnum('type').notNull(),
    percentage:       numeric('percentage', { precision: 5, scale: 2 }).notNull(),
    requiresApproval: boolean('requires_approval').notNull().default(false),
    isActive:         boolean('is_active').notNull().default(true),
    createdAt:        timestamp('created_at', { withTimezone: true })
                        .notNull().defaultNow(),
  })
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 13. DAILY AI SUMMARIES
  // ─────────────────────────────────────────────────────────────────────────────
  export const dailySummaries = pgTable('daily_summaries', {
    id:               uuid('id').primaryKey().defaultRandom(),
    date:             text('date').notNull(),     // YYYY-MM-DD
    summaryText:      text('summary_text').notNull(),
    totalSales:       numeric('total_sales',       { precision: 12, scale: 2 }),
    totalOrders:      integer('total_orders'),
    topProducts:      jsonb('top_products'),       // [{name, qty, revenue}]
    paymentBreakdown: jsonb('payment_breakdown'),  // {cash, gcash, maya, card}
    peakHour:         integer('peak_hour'),        // 0-23
    generatedAt:      timestamp('generated_at',   { withTimezone: true })
                        .notNull().defaultNow(),
  }, (t) => ({
    dateIdx: uniqueIndex('daily_summaries_date_idx').on(t.date),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 14. AUDIT LOG  (security + compliance trail)
  // ─────────────────────────────────────────────────────────────────────────────
  export const auditLog = pgTable('audit_log', {
    id:           uuid('id').primaryKey().defaultRandom(),
    userId:       uuid('user_id').references(() => users.id),
    action:       auditActionEnum('action').notNull(),
    entityType:   varchar('entity_type', { length: 50 }),  // 'order', 'product', etc.
    entityId:     uuid('entity_id'),
    oldValue:     jsonb('old_value'),
    newValue:     jsonb('new_value'),
    ipAddress:    varchar('ip_address', { length: 45 }),
    terminalId:   uuid('terminal_id').references(() => terminals.id),
    notes:        text('notes'),
    createdAt:    timestamp('created_at', { withTimezone: true })
                    .notNull().defaultNow(),
  }, (t) => ({
    userIdx:    index('audit_user_idx').on(t.userId),
    actionIdx:  index('audit_action_idx').on(t.action),
    createdIdx: index('audit_created_idx').on(t.createdAt),
  }))
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RELATIONS  (for Drizzle query builder joins)
  // ─────────────────────────────────────────────────────────────────────────────
  export const usersRelations = relations(users, ({ many }) => ({
    sessions:  many(cashierSessions),
    orders:    many(orders),
  }))
  
  export const terminalsRelations = relations(terminals, ({ many }) => ({
    sessions: many(cashierSessions),
    orders:   many(orders),
  }))
  
  export const cashierSessionsRelations = relations(cashierSessions, ({ one, many }) => ({
    cashier:  one(users,     { fields: [cashierSessions.cashierId],  references: [users.id] }),
    terminal: one(terminals, { fields: [cashierSessions.terminalId], references: [terminals.id] }),
    orders:   many(orders),
  }))
  
  export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
  }))
  
  export const productsRelations = relations(products, ({ one, many }) => ({
    category:      one(categories,  { fields: [products.categoryId], references: [categories.id] }),
    orderItems:    many(orderItems),
    inventoryLogs: many(inventoryLog),
  }))
  
  export const ordersRelations = relations(orders, ({ one, many }) => ({
    session:  one(cashierSessions, { fields: [orders.sessionId],  references: [cashierSessions.id] }),
    terminal: one(terminals,       { fields: [orders.terminalId], references: [terminals.id] }),
    cashier:  one(users,           { fields: [orders.cashierId],  references: [users.id] }),
    items:    many(orderItems),
    payments: many(payments),
    receipt:  many(receipts),
  }))
  
  export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order:   one(orders,   { fields: [orderItems.orderId],   references: [orders.id] }),
    product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  }))
  
  export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  }))
  
  export const receiptsRelations = relations(receipts, ({ one }) => ({
    order: one(orders, { fields: [receipts.orderId], references: [orders.id] }),
  }))
  
  export const inventoryLogRelations = relations(inventoryLog, ({ one }) => ({
    product: one(products, { fields: [inventoryLog.productId], references: [products.id] }),
    user:    one(users,    { fields: [inventoryLog.userId],    references: [users.id] }),
  }))