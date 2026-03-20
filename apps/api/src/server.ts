// apps/api/src/server.ts
import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', async () => {
  return { status: 'ok', service: 'SariPOS API' }
})

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('API running on http://0.0.0.0:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()