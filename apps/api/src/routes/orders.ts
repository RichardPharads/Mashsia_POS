import { FastifyInstance } from 'fastify'
import crypto from 'crypto'

// In-memory order storage for this session
const storedOrders: any[] = []

interface CreateOrderRequest {
  sessionId: string
  terminalId: string
  cashierId: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: string
  }>
  subtotal: string
  vat: string
  total: string
  paymentMethod: string
  cashReceived?: string
  change?: string
  discountType?: string
  discountAmount?: string
  notes?: string
}

export async function registerOrderRoutes(app: FastifyInstance) {
  /**
   * Create order
   * POST /orders
   */
  app.post<{ Body: CreateOrderRequest }>('/orders', async (request, reply) => {
    try {
      const {
        sessionId,
        terminalId,
        cashierId,
        items,
        subtotal,
        vat,
        total,
        paymentMethod,
        cashReceived,
        change,
        discountType,
        discountAmount,
        notes,
      } = request.body

      if (!items || items.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Order must contain at least one item',
        })
      }

      // Create order
      const orderId = crypto.randomUUID()
      const orderNumber = `ORD-${Date.now()}`

      const order = {
        id: orderId,
        sessionId,
        terminalId,
        cashierId,
        orderNumber,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(vat),
        total: parseFloat(total),
        paymentMethod,
        cashReceived: cashReceived ? parseFloat(cashReceived) : null,
        change: change ? parseFloat(change) : null,
        discountType: discountType || null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
        notes,
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
        customerName: null,
        items: items.map((item: any) => ({
          id: crypto.randomUUID(),
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.unitPrice) * item.quantity,
        })),
      }

      storedOrders.push(order)

      return reply.send({
        success: true,
        data: {
          orderId,
          orderNumber,
          total: parseFloat(total),
        },
      })
    } catch (error) {
      console.error('Create order error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create order',
      })
    }
  })

  /**
   * Get orders by session
   * GET /orders?sessionId=<id>
   */
  app.get<{ Querystring: { sessionId?: string } }>(
    '/orders',
    async (request, reply) => {
      try {
        const { sessionId } = request.query

        let orders = storedOrders

        if (sessionId) {
          orders = storedOrders.filter(o => o.sessionId === sessionId)
        }

        return reply.send({
          success: true,
          data: orders,
        })
      } catch (error) {
        console.error('Get orders error:', error)
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch orders',
        })
      }
    }
  )
}

