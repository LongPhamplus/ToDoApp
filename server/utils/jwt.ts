// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  userId: string
  email: string
}

function getSecret(): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret as string
  if (!secret) throw new Error('JWT_SECRET is not configured')
  return secret
}

export function signToken(payload: JwtPayload, rememberMe = false): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: rememberMe ? '30d' : '7d',
  })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload
}
