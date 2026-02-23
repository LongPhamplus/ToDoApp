// server/models/Todo.ts
import mongoose, { type Document } from 'mongoose'

export interface ITodo extends Document {
  title: string
  description?: string
  requirements: { id: string; content: string }[]
  subTasks: { id: string; title: string; completed: boolean }[]
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  categoryId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId | null
  deadline?: Date | null
  notificationSent: boolean
  notifiedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const SubTaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

const RequirementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
})

const TodoSchema = new mongoose.Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    requirements: [RequirementSchema],
    subTasks: [SubTaskSchema],
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // false để tương thích data cũ
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index để tối ưu queries
TodoSchema.index({ userId: 1 })
TodoSchema.index({ categoryId: 1, completed: 1 })
TodoSchema.index({ deadline: 1, completed: 1 })
TodoSchema.index({ priority: 1 })

export const Todo =
  (mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema)) as mongoose.Model<ITodo>
