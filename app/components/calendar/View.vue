<template>
  <div class="h-full flex flex-col">

    <!-- ═══════════════════════════════════════════════════
         WEEK VIEW — 7 columns, compact cells, fixed height
    ════════════════════════════════════════════════════ -->
    <template v-if="view === 'week'">
      <!-- DOW header row -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="day in weekDays"
          :key="'hdr-' + day.date.toISOString()"
          class="flex flex-col items-center gap-0.5"
        >
          <span class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {{ weekdayShort(day.date) }}
          </span>
          <span
            class="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
            :class="day.isToday
              ? 'bg-indigo-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400'"
          >{{ day.date.getDate() }}</span>
        </div>
      </div>

      <!-- Cell row -->
      <div class="grid grid-cols-7 gap-2 flex-1">
        <div
          v-for="day in weekDays"
          :key="'cell-' + day.date.toISOString()"
          class="flex flex-col gap-1 rounded-xl border p-2 cursor-pointer transition-all duration-150 overflow-hidden"
          :class="[
            day.isToday
              ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900 border-transparent bg-indigo-50/40 dark:bg-indigo-500/5'
              : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
          ]"
          @click="openDayDialog(day.date, day.tasks)"
        >
          <!-- Holiday chips in week view -->
          <template v-if="day.holidays.length">
            <CalendarHolidayChip
              v-for="h in day.holidays"
              :key="h.date + h.localName"
              :holiday="h"
            />
          </template>

          <!-- Task chips -->
          <template v-if="day.tasks.length">
            <CalendarEventChip
              v-for="task in day.tasks.slice(0, 5)"
              :key="task._id"
              :task="task"
              :category-color="taskCategoryColor(task)"
              @click.stop="$emit('click-task', task)"
            />
            <span
              v-if="day.tasks.length > 5"
              class="text-[10px] font-semibold text-indigo-400 pl-1"
            >+{{ day.tasks.length - 5 }} more</span>
          </template>

          <!-- Empty state -->
          <div v-else-if="!day.holidays.length" class="flex-1 flex items-center justify-center">
            <span class="text-[11px] text-zinc-300 dark:text-zinc-700">—</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         MONTH VIEW
    ════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'month'">
      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 gap-1.5 mb-2">
        <div
          v-for="label in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']"
          :key="label"
          class="text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 py-1"
        >{{ label }}</div>
      </div>

      <!-- Weeks -->
      <div class="grid grid-cols-7 gap-1.5 flex-1">
        <CalendarCell
          v-for="cell in monthCells"
          :key="cell.date.toISOString()"
          :date="cell.date"
          :tasks="cell.tasks"
          :holidays="cell.holidays"
          :is-today="cell.isToday"
          :is-current-month="cell.isCurrentMonth"
          @click-task="$emit('click-task', $event)"
          @show-more="showMoreTasks = $event"
          @click-day="openDayDialog"
        />
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         YEAR VIEW — 12 mini calendars
    ════════════════════════════════════════════════════ -->
    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(month, idx) in yearMonths"
          :key="idx"
          class="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-3"
        >
          <!-- Month title -->
          <div class="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-2.5 text-center uppercase tracking-wider">
            {{ monthLabel(idx) }}
          </div>
          <!-- Mini dow headers -->
          <div class="grid grid-cols-7 gap-0.5 mb-1">
            <div
              v-for="(l, li) in ['M','T','W','T','F','S','S']"
              :key="li"
              class="text-center text-[9px] font-semibold text-zinc-400 dark:text-zinc-600"
            >{{ l }}</div>
          </div>
          <!-- Mini day cells -->
          <div class="grid grid-cols-7 gap-0.5">
            <div
              v-for="cell in month"
              :key="cell.date.toISOString()"
              class="relative flex flex-col items-center justify-center h-6 rounded-full text-[10px] select-none transition-colors"
              :class="[
                cell.isCurrentMonth ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700',
                cell.isToday ? 'bg-indigo-500 !text-white font-bold' : '',
                cell.holidays.length && !cell.isToday ? '!text-red-500 font-semibold' : '',
                (cell.tasks.length || cell.holidays.length) && !cell.isToday ? 'cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700' : 'cursor-default',
              ]"
              :title="[
                ...cell.holidays.map(h => '🇻🇳 ' + h.localName),
                ...(cell.tasks.length ? [`${cell.tasks.length} task(s)`] : [])
              ].join('\n') || ''"
              @click="(cell.tasks.length || cell.holidays.length) ? openDayDialog(cell.date, cell.tasks) : null"
            >
              {{ cell.date.getDate() }}
              <span
                v-if="(cell.tasks.length || cell.holidays.length) && !cell.isToday"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                :class="cell.holidays.length ? 'bg-red-400' : 'bg-indigo-400'"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         DAY DIALOG — click on any day cell
    ════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="dialog">
        <div
          v-if="dayDialog"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          @click.self="dayDialog = null"
        >
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="dayDialog = null" />

          <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[75vh]">
            <!-- Dialog header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div>
                <p class="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  {{ dayDialogTitle }}
                </p>
                <p class="text-xs text-zinc-400 mt-0.5">
                  <span v-if="dayDialog.holidays.length" class="text-red-400 font-medium">
                    🇻🇳 {{ dayDialog.holidays.map(h => h.localName).join(', ') }}
                    <span v-if="dayDialog.tasks.length"> · </span>
                  </span>
                  <span v-if="dayDialog.tasks.length">
                    {{ dayDialog.tasks.length }} task{{ dayDialog.tasks.length > 1 ? 's' : '' }}
                  </span>
                  <span v-if="!dayDialog.holidays.length && !dayDialog.tasks.length">No tasks</span>
                </p>
              </div>
              <button
                @click="dayDialog = null"
                class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Task list -->
            <div class="overflow-y-auto flex-1">
              <!-- Holiday entries (read-only) -->
              <div
                v-if="dayDialog.holidays.length"
                class="border-b border-zinc-50 dark:border-zinc-800"
              >
                <div
                  v-for="h in dayDialog.holidays"
                  :key="h.date + h.localName"
                  class="flex items-start gap-3 px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
                >
                  <!-- Red left bar -->
                  <span class="shrink-0 mt-1 w-1 h-10 rounded-full bg-red-400" />
                  <div class="flex-1 min-w-0 py-0.5">
                    <p class="text-sm font-semibold text-red-600 dark:text-red-400 leading-snug">
                      🇻🇳 {{ h.localName }}
                    </p>
                    <p v-if="h.name !== h.localName" class="text-xs text-zinc-400 mt-0.5">{{ h.name }}</p>
                    <span class="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-400">
                      Public Holiday
                    </span>
                  </div>
                  <!-- Lock icon — read only -->
                  <svg class="shrink-0 w-4 h-4 text-zinc-300 dark:text-zinc-600 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
              </div>

              <ul v-if="dayDialog.tasks.length">
                <li
                  v-for="task in dayDialog.tasks"
                  :key="task._id"
                  class="group flex items-start gap-3 px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-all"
                  @click="selectTask(task)"
                >
                  <!-- Category color bar -->
                  <span
                    class="shrink-0 mt-1 w-1 h-10 rounded-full"
                    :style="{ backgroundColor: taskCategoryColor(task) || '#6366f1' }"
                  />

                  <!-- Content -->
                  <div class="flex-1 min-w-0 py-0.5">
                    <p :class="['text-sm font-medium leading-snug', task.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-200']">
                      {{ task.title }}
                    </p>
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                      <!-- Category chip -->
                      <span
                        v-if="taskCategory(task)"
                        class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                        :style="{ backgroundColor: (taskCategoryColor(task) || '#6366f1') + '22', color: taskCategoryColor(task) || '#6366f1' }"
                      >
                        <CategoryIcon :icon="taskCategory(task)!.icon" size="w-2.5 h-2.5" :color="taskCategoryColor(task)" />
                        {{ taskCategory(task)!.name }}
                      </span>
                      <!-- Priority badge -->
                      <span
                        class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        :class="{
                          'bg-red-50 text-red-500 dark:bg-red-500/10': task.priority === 'high',
                          'bg-amber-50 text-amber-500 dark:bg-amber-500/10': task.priority === 'medium',
                          'bg-green-50 text-green-600 dark:bg-green-500/10': task.priority === 'low',
                        }"
                      >{{ task.priority }}</span>
                    </div>
                  </div>

                  <!-- Arrow -->
                  <svg class="shrink-0 w-4 h-4 text-zinc-300 dark:text-zinc-600 mt-1 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </li>
              </ul>

              <!-- Empty -->
              <div v-if="!dayDialog.tasks.length && !dayDialog.holidays.length" class="flex flex-col items-center justify-center py-12 text-center">
                <svg class="w-10 h-10 text-zinc-200 dark:text-zinc-700 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm text-zinc-400">No tasks on this day</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- "Show more" overlay (month view overflow) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showMoreTasks"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          @click.self="showMoreTasks = null"
        >
          <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-zinc-800 dark:text-zinc-200">All tasks</h3>
              <button @click="showMoreTasks = null" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="flex flex-col gap-1.5">
              <CalendarEventChip
                v-for="task in showMoreTasks"
                :key="task._id"
                :task="task"
                :category-color="taskCategoryColor(task)"
                @click="showMoreTasks = null; $emit('click-task', $event)"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'
import type { Holiday } from '~/composables/useHolidays'
import { toDateStr } from '~/composables/useHolidays'

type CalView = 'week' | 'month' | 'year'

const props = defineProps<{
  view: CalView
  currentDate: Date
  todos: Todo[]
  holidays?: Holiday[]
}>()

const emit = defineEmits<{ (e: 'click-task', task: Todo): void }>()

const categoryStore = useCategoryStore()
const showMoreTasks = ref<Todo[] | null>(null)

// ─── day dialog ──────────────────────────────────────────────────────────────
const dayDialog = ref<{ date: Date; tasks: Todo[]; holidays: Holiday[] } | null>(null)

const dayDialogTitle = computed(() => {
  if (!dayDialog.value) return ''
  const d = dayDialog.value.date
  const today = new Date()
  const isToday = isSameDay(d, today)
  const isTomorrow = isSameDay(d, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))
  const isYesterday = isSameDay(d, new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
  if (isToday) return 'Today · ' + d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  if (isTomorrow) return 'Tomorrow · ' + d.toLocaleDateString('en', { month: 'long', day: 'numeric' })
  if (isYesterday) return 'Yesterday · ' + d.toLocaleDateString('en', { month: 'long', day: 'numeric' })
  return d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})

function openDayDialog(date: Date, tasks: Todo[]) {
  dayDialog.value = { date, tasks, holidays: holidaysOnDay(date) }
}

function selectTask(task: Todo) {
  dayDialog.value = null
  emit('click-task', task)
}

// ─── helpers ────────────────────────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function startOfWeek(d: Date): Date {
  const clone = new Date(d)
  const dow = (clone.getDay() + 6) % 7
  clone.setDate(clone.getDate() - dow)
  clone.setHours(0, 0, 0, 0)
  return clone
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

function sortTasks(tasks: Todo[]): Todo[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
  })
}

function tasksOnDay(date: Date): Todo[] {
  const tasks = props.todos.filter(t => {
    if (!t.deadline) return false
    return isSameDay(new Date(t.deadline), date)
  })
  return sortTasks(tasks)
}

function holidaysOnDay(date: Date): Holiday[] {
  if (!props.holidays?.length) return []
  const ds = toDateStr(date)
  return props.holidays.filter(h => h.date === ds)
}

function isToday(d: Date) { return isSameDay(d, new Date()) }
function weekdayShort(d: Date) { return d.toLocaleDateString('en', { weekday: 'short' }) }
function monthLabel(idx: number) {
  return new Date(props.currentDate.getFullYear(), idx, 1).toLocaleDateString('en', { month: 'long' })
}
function taskCategoryColor(task: Todo): string | undefined {
  if (!task.categoryId) return undefined
  return categoryStore.getCategoryById(task.categoryId as string)?.color
}
function taskCategory(task: Todo) {
  if (!task.categoryId) return undefined
  return categoryStore.getCategoryById(task.categoryId as string)
}

// ─── week ────────────────────────────────────────────────────────────────────
const weekDays = computed(() => {
  const start = startOfWeek(props.currentDate)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return { date, tasks: tasksOnDay(date), holidays: holidaysOnDay(date), isToday: isToday(date) }
  })
})

// ─── month ───────────────────────────────────────────────────────────────────
const monthCells = computed(() => {
  const y = props.currentDate.getFullYear()
  const m = props.currentDate.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay  = new Date(y, m + 1, 0)
  const leadDow  = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((leadDow + lastDay.getDate()) / 7) * 7

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(y, m, 1 - leadDow + i)
    return {
      date,
      tasks: tasksOnDay(date),
      holidays: holidaysOnDay(date),
      isToday: isToday(date),
      isCurrentMonth: date.getMonth() === m,
    }
  })
})

// ─── year ────────────────────────────────────────────────────────────────────
const yearMonths = computed(() => {
  const y = props.currentDate.getFullYear()
  return Array.from({ length: 12 }, (_, m) => {
    const firstDay = new Date(y, m, 1)
    const lastDay  = new Date(y, m + 1, 0)
    const leadDow  = (firstDay.getDay() + 6) % 7
    const totalCells = Math.ceil((leadDow + lastDay.getDate()) / 7) * 7
    return Array.from({ length: totalCells }, (_, i) => {
      const date = new Date(y, m, 1 - leadDow + i)
      return { date, tasks: tasksOnDay(date), holidays: holidaysOnDay(date), isToday: isToday(date), isCurrentMonth: date.getMonth() === m }
    })
  })
})

// Close dialogs on Escape
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (dayDialog.value) { dayDialog.value = null; return }
      showMoreTasks.value = null
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
.dialog-enter-active { transition: opacity 0.2s ease; }
.dialog-leave-active { transition: opacity 0.15s ease; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
