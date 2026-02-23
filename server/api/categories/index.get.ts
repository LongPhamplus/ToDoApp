// server/api/categories/index.get.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Category } from '../../../server/models/Category'
import type { ApiResponse } from '~/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const categories = await Category.find({ userId: event.context.userId }).sort({ order: 1 })

    return {
      success: true,
      data: categories,
    }
  } catch (error: any) {
    console.error('❌ Error fetching categories:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to fetch categories',
    }
  }
})
