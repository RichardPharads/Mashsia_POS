// apps/api/src/server.ts
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { registerAuthRoutes } from './routes/auth'
import { registerProductRoutes } from './routes/products'
import { registerOrderRoutes } from './routes/orders'

const app = Fastify({ logger: true })

const start = async () => {
  try {
    // Enable CORS for all origins
    await app.register(fastifyCors, {
      origin: true, // Allow any origin
    })

    app.get('/health', async () => {
      return { status: 'ok', service: 'SariPOS API' }
    })

    // Register routes
    registerAuthRoutes(app)
    registerProductRoutes(app)
    registerOrderRoutes(app)

    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('API running on http://0.0.0.0:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()