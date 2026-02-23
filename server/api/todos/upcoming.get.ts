// server/api/todos/upcoming.get.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Todo } from '../../../server/models/Todo'
import type { ApiResponse } from '~/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Lấy tasks có deadline trong 24h tới hoặc đã quá hạn
    const todos = await Todo.find({
      userId: event.context.userId,
      completed: false,
      deadline: { $lte: tomorrow },
    })
      .populate('categoryId')
      .sort({ deadline: 1 })

    return {
      success: true,
      data: todos,
    }
  } catch (error: any) {
    console.error('❌ Error fetching upcoming todos:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to fetch upcoming todos',
    }
  }
})
