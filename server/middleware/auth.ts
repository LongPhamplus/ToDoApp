// server/middleware/auth.ts
import { verifyToken } from '../utils/jwt'

// Public routes that don't require authentication
const PUBLIC_PREFIXES = ['/api/auth/']
const PUBLIC_ROUTES = ['/api/health']

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''
  const path = url.split('?')[0] ?? ''

  // Allow public auth routes and health check
  if (PUBLIC_ROUTES.includes(path)) return
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return

  // Only guard /api/* routes
  if (!path.startsWith('/api/')) return

  // Verify token
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  try {
    const payload = verifyToken(token)
    // Attach userId to context for downstream handlers
    event.context.userId = payload.userId
    event.context.userEmail = payload.email
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' })
  }
})
