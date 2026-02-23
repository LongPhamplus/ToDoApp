// server/api/todos/index.post.ts
import { connectDB } from '../../../server/utils/mongoose'
import { Todo } from '../../../server/models/Todo'
import type { ApiResponse } from '~/types/todo'
import { z } from 'zod'

const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  categoryId: z.string().min(1, 'Category is required'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  deadline: z.string().optional(),
  requirements: z.array(z.object({
    id: z.string(),
    content: z.string(),
  })).optional().default([]),
  subTasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
  })).optional().default([]),
})

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const body = await readBody(event)

    // Validate input
    const validation = CreateTodoSchema.safeParse(body)
    if (!validation.success) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Validation failed',
      }
    }

    const data = validation.data

    const todo = new Todo({
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      userId: event.context.userId,
      priority: data.priority,
      deadline: data.deadline ? new Date(data.deadline) : null,
      requirements: data.requirements,
      subTasks: data.subTasks,
      completed: false,
      notificationSent: false,
      notifiedAt: null,
    })

    await todo.save()
    await todo.populate('categoryId')

    setResponseStatus(event, 201)
    return {
      success: true,
      data: todo,
      message: 'Todo created successfully',
    }
  } catch (error: any) {
    console.error('❌ Error creating todo:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: error.message || 'Failed to create todo',
    }
  }
})
