// app/types/todo.ts

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Requirement {
  id: string
  content: string
}

export interface Category {
  _id: string
  name: string
  color: string   // hex e.g. "#6366f1"
  icon: string    // SVG string or emoji
  order: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Todo {
  _id: string
  title: string
  description: string
  requirements: Requirement[]
  subTasks: SubTask[]
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  categoryId: string
  category?: Category
  deadline: string | null
  notificationSent: boolean
  notifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue'
export type SortBy = 'createdAt' | 'deadline' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface TodoFilters {
  search: string
  status: FilterStatus
  priority: 'all' | 'high' | 'medium' | 'low'
  categoryId: string | 'all'
  sortBy: SortBy
  sortOrder: SortOrder
}

export interface NotificationSettings {
  enabled: boolean
  deadlineWarnings: {
    oneDayBefore: boolean
    threeHoursBefore: boolean
    oneHourBefore: boolean
  }
  overdueReminders: boolean
  soundEnabled: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
