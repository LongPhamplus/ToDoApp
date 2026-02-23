// server/api/todos/[id].delete.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Todo } from '../../../server/models/Todo'
import type { ApiResponse } from '~/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    const todo = await Todo.findOneAndDelete({ _id: id, userId: event.context.userId })

    if (!todo) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Todo not found',
      }
    }

    return {
      success: true,
      message: 'Todo deleted successfully',
    }
  } catch (error: any) {
    console.error('❌ Error deleting todo:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to delete todo',
    }
  }
})
