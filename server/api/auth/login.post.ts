// server/api/auth/login.post.ts
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { signToken } from '../../utils/jwt'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
      })
    }

    const { email, password, rememberMe } = parsed.data

    // Find user — explicitly select passwordHash (select: false on schema)
    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      throw createError({ statusCode: 401, message: 'Invalid email or password' })
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw createError({ statusCode: 401, message: 'Invalid email or password' })
    }

    // Sign token
    const token = signToken({ userId: String(user._id), email: user.email }, rememberMe)

    // Set httpOnly cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
      path: '/',
    })

    return {
      success: true,
      data: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 500, message: 'Server error' })
  }
})
