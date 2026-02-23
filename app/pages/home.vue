<template>
  <div class="min-h-full py-6 px-4 sm:px-6 flex flex-col gap-5 h-full">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Calendar</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">View tasks by deadline</p>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 flex-wrap">
        <div v-for="stat in legendStats" :key="stat.label" class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span class="w-2 h-2 rounded-full" :style="{ background: stat.color }" />
          <span class="font-semibold" :style="{ color: stat.color }">{{ stat.value }}</span>
          {{ stat.label }}
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <CalendarToolbar
        :model-value="view"
        :title="toolbarTitle"
        @update:model-value="view = $event"
        @prev="navigate(-1)"
        @next="navigate(1)"
        @today="goToday"
      />
    </div>

    <!-- Calendar View -->
    <div
      class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      :class="view === 'week' ? 'flex-1 min-h-0' : ''"
    >
      <CalendarView
        :view="view"
        :current-date="currentDate"
        :todos="todoStore.todos"
        :holidays="holidays"
        @click-task="openTask"
      />
    </div>

    <!-- Task detail modal -->
    <TasksDetailModal
      v-model="showDetail"
      :task="selectedTask"
      @close="showDetail = false"
    />

    <!-- FAB create -->
    <TasksCreateForm />
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'
import type { Holiday } from '~/composables/useHolidays'

useHead({ title: 'Calendar — Focus' })

const todoStore  = useTodoStore()
const categoryStore = useCategoryStore()
const { ensureYears } = useHolidays()

// ─── view state ──────────────────────────────────────────────────────────────
type CalView = 'week' | 'month' | 'year'
const view = ref<CalView>('month')
const currentDate = ref(new Date())

// ─── holidays — flat list for the relevant year(s) ───────────────────────────
const holidays = ref<Holiday[]>([])

async function loadHolidays() {
  const y = currentDate.value.getFullYear()
  // Pre-fetch this year + next year for smooth navigation
  await ensureYears(y, y + 1)
  // Collect all holidays from cache for current visible year
  // (year view shows all 12 months; week/month only need ±1 year at most)
  const { fetchYear } = useHolidays()
  const [curr, next] = await Promise.all([fetchYear(y), fetchYear(y + 1)])
  holidays.value = [...curr, ...next]
}

onMounted(async () => {
  await Promise.all([todoStore.fetchTodos(), categoryStore.fetchCategories(), loadHolidays()])
})

// Reload holidays when year changes
watch(() => currentDate.value.getFullYear(), loadHolidays)

// ─── navigation ──────────────────────────────────────────────────────────────
function navigate(dir: -1 | 1) {
  const d = new Date(currentDate.value)
  if (view.value === 'week') {
    d.setDate(d.getDate() + dir * 7)
  } else if (view.value === 'month') {
    d.setMonth(d.getMonth() + dir)
  } else {
    d.setFullYear(d.getFullYear() + dir)
  }
  currentDate.value = d
}

function goToday() { currentDate.value = new Date() }

// ─── toolbar title ────────────────────────────────────────────────────────────
const toolbarTitle = computed(() => {
  const d = currentDate.value
  if (view.value === 'year') {
    return String(d.getFullYear())
  }
  if (view.value === 'month') {
    return d.toLocaleDateString('en', { month: 'long', year: 'numeric' })
  }
  // week: show start – end
  const start = new Date(d)
  const dow = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dow)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('en', opts)} – ${end.toLocaleDateString('en', { ...opts, year: 'numeric' })}`
})

// ─── task detail ─────────────────────────────────────────────────────────────
const showDetail  = ref(false)
const selectedTask = ref<Todo | null>(null)

function openTask(task: Todo) {
  selectedTask.value = task
  showDetail.value   = true
}

// ─── legend ──────────────────────────────────────────────────────────────────
const legendStats = computed(() => {
  const todos = todoStore.todos
  return [
    { label: 'active',    value: todos.filter(t => !t.completed).length,                                           color: '#6366f1' },
    { label: 'completed', value: todos.filter(t => t.completed).length,                                            color: '#22c55e' },
    { label: 'overdue',   value: todos.filter(t => !t.completed && t.deadline && new Date(t.deadline) < new Date()).length, color: '#ef4444' },
  ]
})
</script>
