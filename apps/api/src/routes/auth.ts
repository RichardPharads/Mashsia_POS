import { FastifyInstance } from 'fastify'
import crypto from 'crypto'

// Mock users with hashed PINs - for testing without database
const MOCK_USERS = [
  { id: '1', name: 'Owner - Kape Manager', email: 'owner@kape.com', pin: '0000', role: 'owner', isActive: true },
  { id: '2', name: 'Manager - Maria Santos', email: 'manager@kape.com', pin: '1234', role: 'manager', isActive: true },
  { id: '3', name: 'Cashier - Juan dela Cruz', email: 'juan@kape.com', pin: '1111', role: 'cashier', isActive: true },
  { id: '4', name: 'Cashier - Rosa Garcia', email: 'rosa@kape.com', pin: '2222', role: 'cashier', isActive: true },
]

// Allowed roles for POS Terminal (Cashier interface)
const ALLOWED_POS_ROLES = ['cashier', 'manager']

export async function registerAuthRoutes(app: FastifyInstance) {
  /**
   * Login with PIN
   * POST /auth/login-pin
   * Body: { pin: string }
   * Returns: { user: User, session_id: string, token: string }
   */
  app.post<{ Body: { pin: string } }>('/auth/login-pin', async (request, reply) => {
    try {
      const { pin } = request.body

      if (!pin || pin.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'PIN is required',
        })
      }

      // Find user by PIN - using simple string comparison for now
      const user = MOCK_USERS.find(u => u.pin === pin && u.isActive)

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid PIN',
        })
      }

      // Check if user role is allowed for POS Terminal
      if (!ALLOWED_POS_ROLES.includes(user.role)) {
        return reply.status(403).send({
          success: false,
          error: `${user.role.toUpperCase()} accounts use the Admin Dashboard, not POS Terminal`,
        })
      }

      // Generate session and token
      const sessionId = crypto.randomUUID()
      const terminalId = crypto.randomUUID()
      const token = crypto.randomBytes(32).toString('hex')

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          },
          session_id: sessionId,
          terminal_id: terminalId,
          token,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Login failed',
      })
    }
  })

  /**
   * Get current user
   * GET /auth/me
   */
  app.get('/auth/me', async (request, reply) => {
    try {
      return reply.send({
        success: true,
        data: null,
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to get current user',
      })
    }
  })

  /**
   * Logout
   * POST /auth/logout
   */
  app.post('/auth/logout', async (request, reply) => {
    try {
      return reply.send({
        success: true,
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Logout failed',
      })
    }
  })
}

