// server/api/categories/[id].put.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Category } from '../../../server/models/Category'
import type { ApiResponse } from '~/types/todo'
import { z } from 'zod'

const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().min(1).optional(),
})

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const validation = UpdateCategorySchema.safeParse(body)
    if (!validation.success) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Validation failed',
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: event.context.userId },
      validation.data,
      { new: true }
    )

    if (!category) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Category not found',
      }
    }

    return {
      success: true,
      data: category,
      message: 'Category updated successfully',
    }
  } catch (error: any) {
    console.error('❌ Error updating category:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to update category',
    }
  }
})
