// server/api/auth/me.get.ts
import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth_token')
    if (!token) {
      throw createError({ statusCode: 401, message: 'Not authenticated' })
    }

    const payload = verifyToken(token)

    await connectDB()
    const user = await User.findById(payload.userId)
    if (!user) {
      throw createError({ statusCode: 401, message: 'User not found' })
    }

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
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
})
