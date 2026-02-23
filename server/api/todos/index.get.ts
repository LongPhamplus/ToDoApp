// server/api/todos/index.get.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Todo } from '../../../server/models/Todo'
import { Category } from '../../../server/models/Category'
import type { ApiResponse, TodoFilters } from '~/types/todo'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const userId = event.context.userId
    const query = getQuery(event) as Partial<TodoFilters>

    let mongoQuery: any = { userId }

    // Filter by status
    if (query.status === 'completed') {
      mongoQuery.completed = true
    } else if (query.status === 'active') {
      mongoQuery.completed = false
    }

    // Filter by priority
    if (query.priority && query.priority !== 'all') {
      mongoQuery.priority = query.priority
    }

    // Filter by category
    if (query.categoryId && query.categoryId !== 'all') {
      mongoQuery.categoryId = query.categoryId
    }

    // Search by title or description
    if (query.search) {
      mongoQuery.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ]
    }

    // Build sort object
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1
    const sort: any = {}
    sort[sortBy] = sortOrder

    // Execute query with populate
    let todos = await Todo.find(mongoQuery)
      .populate('categoryId')
      .sort(sort)
      .exec()

    return {
      success: true,
      data: todos,
    }
  } catch (error: any) {
    console.error('❌ Error fetching todos:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to fetch todos',
    }
  }
})
