// server/api/auth/register.post.ts
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { signToken } from '../../utils/jwt'
import { seedCategories } from '../../utils/seedCategories'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

    const { name, email, password } = parsed.data

    // Check duplicate email
    const existing = await User.findOne({ email })
    if (existing) {
      throw createError({ statusCode: 409, message: 'Email already in use' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({ name, email, passwordHash })

    // Seed default categories for new user
    await seedCategories(String(user._id))

    // Sign token
    const token = signToken({ userId: String(user._id), email: user.email })

    // Set httpOnly cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
    // MongoDB duplicate key on email (race condition)
    if (err.code === 11000) {
      throw createError({ statusCode: 409, message: 'Email already in use' })
    }
    throw createError({ statusCode: 500, message: 'Server error' })
  }
})
