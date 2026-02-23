// server/api/todos/[id].put.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Todo } from '../../../server/models/Todo'
import type { ApiResponse } from '~/types/todo'
import { z } from 'zod'

const UpdateTodoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  deadline: z.string().optional(),
  completed: z.boolean().optional(),
  requirements: z.array(z.object({
    id: z.string(),
    content: z.string(),
  })).optional(),
  subTasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
  })).optional(),
})

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const validation = UpdateTodoSchema.safeParse(body)
    if (!validation.success) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data
    const updateData: any = { ...data }

    // Convert deadline string to Date if provided
    if (data.deadline) {
      updateData.deadline = new Date(data.deadline)
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: event.context.userId },
      updateData,
      { new: true }
    ).populate('categoryId')

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
      message: 'Todo updated successfully',
    }
  } catch (error: any) {
    console.error('❌ Error updating todo:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to update todo',
    }
  }
})
