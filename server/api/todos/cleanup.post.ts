// server/api/todos/cleanup.post.ts
import { connectDB } from '../../utils/mongoose'
import { Todo } from '../../models/Todo'
import type { ApiResponse } from '~/types/todo'
import { z } from 'zod'

const CleanupSchema = z.object({
  // Xóa task đã hoàn thành sau N ngày
  completedOlderThanDays: z.number().int().min(0).optional(),
  // Xóa TẤT CẢ task đã hoàn thành
  completedAll: z.boolean().optional(),
  // Xóa task quá hạn hơn N ngày (chưa hoàn thành)
  overdueOlderThanDays: z.number().int().min(0).optional(),
  // Xóa TẤT CẢ task quá hạn (chưa hoàn thành)
  overdueAll: z.boolean().optional(),
  // Chỉ preview, không xóa thật
  dryRun: z.boolean().default(false),
})

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    await connectDB()

    const userId = event.context.userId
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const validation = CleanupSchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0]?.message || 'Validation failed',
      })
    }

    const {
      completedOlderThanDays,
      completedAll,
      overdueOlderThanDays,
      overdueAll,
      dryRun,
    } = validation.data

    const now = new Date()

    // Build danh sách các điều kiện OR để tìm tasks cần xóa
    const orConditions: any[] = []

    // ── Completed tasks ──────────────────────────────────────────────────
    if (completedAll) {
      orConditions.push({ completed: true })
    } else if (completedOlderThanDays !== undefined) {
      const cutoff = new Date(now.getTime() - completedOlderThanDays * 86400_000)
      orConditions.push({ completed: true, updatedAt: { $lt: cutoff } })
    }

    // ── Overdue tasks ────────────────────────────────────────────────────
    if (overdueAll) {
      orConditions.push({ completed: false, deadline: { $lt: now } })
    } else if (overdueOlderThanDays !== undefined) {
      const cutoff = new Date(now.getTime() - overdueOlderThanDays * 86400_000)
      orConditions.push({ completed: false, deadline: { $lt: cutoff } })
    }

    if (orConditions.length === 0) {
      return { success: true, data: { deleted: 0, preview: [] }, message: 'No criteria specified' }
    }

    const query = { userId, $or: orConditions }

    if (dryRun) {
      // Chỉ trả về danh sách preview, không xóa
      const tasks = await Todo.find(query)
        .populate('categoryId', 'name color icon')
        .select('title completed deadline updatedAt priority categoryId')
        .sort({ deadline: 1, updatedAt: 1 })
        .lean()

      return {
        success: true,
        data: {
          deleted: 0,
          preview: tasks.map((t: any) => ({
            _id: t._id,
            title: t.title,
            completed: t.completed,
            deadline: t.deadline,
            updatedAt: t.updatedAt,
            priority: t.priority,
            category: t.categoryId,
          })),
        },
      }
    }

    // Xóa thật
    const result = await Todo.deleteMany(query)

    return {
      success: true,
      data: { deleted: result.deletedCount },
      message: `Đã xóa ${result.deletedCount} task`,
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 500, message: err.message || 'Server error' })
  }
})
