// app/stores/todo.ts
import { defineStore } from 'pinia'
import type { Todo, TodoFilters } from '~/types/todo'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<TodoFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    categoryId: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // ── Filtered & Sorted view ─────────────────────────────────────────────
  const filteredTodos = computed(() => {
    let list = [...todos.value]

    // search
    if (filters.value.search.trim()) {
      const q = filters.value.search.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
      )
    }

    // status
    if (filters.value.status === 'active') list = list.filter(t => !t.completed)
    else if (filters.value.status === 'completed') list = list.filter(t => t.completed)
    else if (filters.value.status === 'overdue') {
      const now = new Date()
      list = list.filter(t => !t.completed && !!t.deadline && new Date(t.deadline) < now)
    }

    // priority
    if (filters.value.priority !== 'all')
      list = list.filter(t => t.priority === filters.value.priority)

    // category
    if (filters.value.categoryId !== 'all')
      list = list.filter(t => t.categoryId === filters.value.categoryId)

    // sort
    list.sort((a, b) => {
      let av: any, bv: any
      switch (filters.value.sortBy) {
        case 'title':
          av = a.title.toLowerCase(); bv = b.title.toLowerCase(); break
        case 'priority': {
          const p = { high: 0, medium: 1, low: 2 }
          av = p[a.priority]; bv = p[b.priority]; break
        }
        case 'deadline':
          av = a.deadline ? new Date(a.deadline).getTime() : Infinity
          bv = b.deadline ? new Date(b.deadline).getTime() : Infinity
          break
        default:
          av = new Date(a.createdAt).getTime()
          bv = new Date(b.createdAt).getTime()
      }
      return filters.value.sortOrder === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
    })

    return list
  })

  // Grouped for dashboard
  const overdueTodos = computed(() => {
    const now = new Date()
    return filteredTodos.value.filter(t => !t.completed && t.deadline && new Date(t.deadline) < now)
  })

  const todayTodos = computed(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)
    return filteredTodos.value.filter(t => {
      if (t.deadline) {
        const d = new Date(t.deadline)
        return d >= todayStart && d < todayEnd
      }
      // Tasks without deadline that are not overdue go into "today"
      return !t.completed
    })
  })

  const stats = computed(() => ({
    total: todos.value.length,
    completed: todos.value.filter(t => t.completed).length,
    active: todos.value.filter(t => !t.completed).length,
    overdue: todos.value.filter(t => !t.completed && t.deadline && new Date(t.deadline) < new Date()).length,
    todayTotal: todayTodos.value.length,
    todayDone: todayTodos.value.filter(t => t.completed).length,
  }))

  // ── API ────────────────────────────────────────────────────────────────

  // The server .populate('categoryId') returns categoryId as a full object.
  // Normalize it so categoryId is always a plain string and the populated
  // data lives in todo.category (matching the Todo type).
  function normalizeTodo(raw: any): Todo {
    if (raw.categoryId && typeof raw.categoryId === 'object') {
      return { ...raw, category: raw.categoryId, categoryId: raw.categoryId._id }
    }
    return raw as Todo
  }

  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ success: boolean; data: any[] }>('/api/todos')
      if (data.success) todos.value = data.data.map(normalizeTodo)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createTodo(payload: Partial<Todo>) {
    const data = await $fetch<{ success: boolean; data: any }>('/api/todos', {
      method: 'POST',
      body: payload,
    })
    if (data.success) todos.value.unshift(normalizeTodo(data.data))
    return normalizeTodo(data.data)
  }

  async function updateTodo(id: string, payload: Partial<Todo>) {
    const data = await $fetch<{ success: boolean; data: any }>(`/api/todos/${id}`, {
      method: 'PUT',
      body: payload,
    })
    if (data.success) {
      const idx = todos.value.findIndex(t => t._id === id)
      if (idx !== -1) todos.value[idx] = normalizeTodo(data.data)
    }
    return normalizeTodo(data.data)
  }

  async function toggleTodo(id: string) {
    const todo = todos.value.find(t => t._id === id)
    if (!todo) return
    return updateTodo(id, { completed: !todo.completed })
  }

  async function deleteTodo(id: string) {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' as any })
    todos.value = todos.value.filter(t => t._id !== id)
  }

  async function cleanupTodos(options: {
    completedOlderThanDays?: number
    completedAll?: boolean
    overdueOlderThanDays?: number
    overdueAll?: boolean
    dryRun?: boolean
  }) {
    const data = await $fetch<{ success: boolean; data: { deleted: number; preview: any[] }; message?: string }>('/api/todos/cleanup', {
      method: 'POST',
      body: options,
    })
    if (data.success && !options.dryRun) {
      await fetchTodos()
    }
    return data
  }

  function setFilter(updates: Partial<TodoFilters>) {
    Object.assign(filters.value, updates)
  }

  return {
    todos, loading, error, filters,
    filteredTodos, overdueTodos, todayTodos, stats,
    fetchTodos, createTodo, updateTodo, toggleTodo, deleteTodo, cleanupTodos, setFilter,
  }
})
