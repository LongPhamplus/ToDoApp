// server/api/todos/[id].get.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Todo } from '../../../server/models/Todo'
import type { ApiResponse } from '~/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    const todo = await Todo.findOne({ _id: id, userId: event.context.userId }).populate('categoryId')

    if (!todo) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Todo not found',
      }
    }

    return {
      success: true,
      data: todo,
    }
  } catch (error: any) {
    console.error('❌ Error fetching todo:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to fetch todo',
    }
  }
})
