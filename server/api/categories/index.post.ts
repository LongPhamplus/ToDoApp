// server/api/categories/index.post.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Category } from '../../../server/models/Category'
import type { ApiResponse } from '~/types/todo'
import { z } from 'zod'

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().min(1, 'Icon is required'),
})

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const body = await readBody(event)

    // Validate input
    const validation = CreateCategorySchema.safeParse(body)
    if (!validation.success) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Validation failed',
      }
    }

    const { name, color, icon } = validation.data

    // Check if category already exists for this user
    const existing = await Category.findOne({ name, userId: event.context.userId })
    if (existing) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Category already exists',
      }
    }

    // Get next order
    const lastCategory = await Category.findOne({ userId: event.context.userId }).sort({ order: -1 })
    const order = (lastCategory?.order || 0) + 1

    const category = new Category({
      name,
      color,
      icon,
      order,
      isDefault: false,
      userId: event.context.userId,
    })

    await category.save()

    return {
      success: true,
      data: category,
      message: 'Category created successfully',
    }
  } catch (error: any) {
    console.error('❌ Error creating category:', error)
    // MongoDB duplicate key (race condition bypass)
    if (error.code === 11000) {
      setResponseStatus(event, 400)
      return { success: false, error: 'Category already exists' }
    }
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to create category',
    }
  }
})
