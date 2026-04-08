import { FastifyInstance } from 'fastify'

// Mock categories
const MOCK_CATEGORIES = [
  { id: '1', name: 'Coffee', description: 'Espresso drinks and coffee' },
  { id: '2', name: 'Tea', description: 'Tea beverages' },
  { id: '3', name: 'Pastries', description: 'Breads and pastries' },
  { id: '4', name: 'Sandwiches', description: 'Breakfast and lunch sandwiches' },
  { id: '5', name: 'Desserts', description: 'Cakes and desserts' },
]

// Mock products
const MOCK_PRODUCTS = [
  { id: '1', categoryId: '1', name: 'Espresso', price: '60.00', sku: 'ESP-001', stockQuantity: 100, trackStock: true },
  { id: '2', categoryId: '1', name: 'Americano', price: '75.00', sku: 'AME-001', stockQuantity: 100, trackStock: true },
  { id: '3', categoryId: '1', name: 'Cappuccino', price: '95.00', sku: 'CAP-001', stockQuantity: 100, trackStock: true },
  { id: '4', categoryId: '1', name: 'Latte', price: '95.00', sku: 'LAT-001', stockQuantity: 100, trackStock: true },
  { id: '5', categoryId: '1', name: 'Flat White', price: '100.00', sku: 'FW-001', stockQuantity: 100, trackStock: true },
  { id: '6', categoryId: '1', name: 'Café Café (Spanish Latte)', price: '85.00', sku: 'CC-001', stockQuantity: 100, trackStock: true },
  { id: '7', categoryId: '2', name: 'Iced Tea', price: '55.00', sku: 'ICED-TEA', stockQuantity: 100, trackStock: true },
  { id: '8', categoryId: '2', name: 'Hot Tea', price: '45.00', sku: 'HOT-TEA', stockQuantity: 100, trackStock: true },
  { id: '9', categoryId: '3', name: 'Croissant', price: '65.00', sku: 'CROI-001', stockQuantity: 50, trackStock: true },
  { id: '10', categoryId: '3', name: 'Muffin', price: '55.00', sku: 'MUFF-001', stockQuantity: 60, trackStock: true },
  { id: '11', categoryId: '4', name: 'Ham & Cheese Sandwich', price: '120.00', sku: 'HAM-001', stockQuantity: 30, trackStock: true },
  { id: '12', categoryId: '5', name: 'Chocolate Cake', price: '145.00', sku: 'CHOC-CAKE', stockQuantity: 20, trackStock: true },
]

export async function registerProductRoutes(app: FastifyInstance) {
  /**
   * Get all categories
   * GET /categories
   */
  app.get('/categories', async (request, reply) => {
    try {
      return reply.send({
        success: true,
        data: MOCK_CATEGORIES,
      })
    } catch (error) {
      console.error('Get categories error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch categories',
      })
    }
  })

  /**
   * Get all products
   * GET /products
   * Query: ?categoryId=<id> (optional filter)
   */
  app.get<{ Querystring: { categoryId?: string } }>(
    '/products',
    async (request, reply) => {
      try {
        const { categoryId } = request.query

        let products = MOCK_PRODUCTS

        if (categoryId) {
          products = MOCK_PRODUCTS.filter(p => p.categoryId === categoryId)
        }

        return reply.send({
          success: true,
          data: products,
        })
      } catch (error) {
        console.error('Get products error:', error)
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch products',
        })
      }
    }
  )

  /**
   * Get single product
   * GET /products/:id
   */
  app.get<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    try {
      const { id } = request.params

      const product = MOCK_PRODUCTS.find(p => p.id === id)

      if (!product) {
        return reply.status(404).send({
          success: false,
          error: 'Product not found',
        })
      }

      return reply.send({
        success: true,
        data: product,
      })
    } catch (error) {
      console.error('Get product error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch product',
      })
    }
  })
}

