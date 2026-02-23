// server/api/categories/[id].delete.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Category } from '../../../server/models/Category'
import { Todo } from '../../../server/models/Todo'
import type { ApiResponse } from '~/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    const category = await Category.findOne({ _id: id, userId: event.context.userId })
    if (!category) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Category not found',
      }
    }

    // Prevent deletion of default categories
    if (category.isDefault) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Cannot delete default categories',
      }
    }

    // Get the "Khác" (Other) category for this user
    const otherCategory = await Category.findOne({ name: 'Khác', userId: event.context.userId })

    // Move all todos to "Khác" category if it exists
    if (otherCategory) {
      await Todo.updateMany({ categoryId: id, userId: event.context.userId }, { categoryId: otherCategory._id })
    }

    // Delete the category
    await Category.findOneAndDelete({ _id: id, userId: event.context.userId })

    return {
      success: true,
      message: 'Category deleted successfully',
    }
  } catch (error: any) {
    console.error('❌ Error deleting category:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to delete category',
    }
  }
})
