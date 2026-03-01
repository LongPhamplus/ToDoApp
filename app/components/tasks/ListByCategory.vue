<template>
  <div>
    <!-- Category grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="cat in groups"
        :key="cat._id"
        class="group relative flex flex-col items-start gap-3 p-4 rounded-2xl border bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer text-left"
        :class="[
          selectedCat?._id === cat._id
            ? 'border-2 scale-[0.98]'
            : 'border-zinc-200 dark:border-zinc-800 hover:scale-[0.985]'
        ]"
        :style="selectedCat?._id === cat._id ? { borderColor: cat.color } : {}"
        @click="openCat(cat)"
      >
        <!-- Icon badge -->
        <span
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          :style="{ backgroundColor: cat.color + '22', border: '1.5px solid ' + cat.color + '55' }"
        >
          <CategoryIcon :icon="cat.icon" size="w-5 h-5" :color="cat.color" />
        </span>

        <!-- Info -->
        <div class="w-full min-w-0">
          <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{{ cat.name }}</p>
          <p class="text-[11px] text-zinc-400 tabular-nums mt-0.5">{{ cat.done }}/{{ cat.total }} done</p>
        </div>

        <!-- Progress bar -->
        <div class="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: cat.pct + '%', backgroundColor: cat.color }"
          />
        </div>

        <!-- Pct badge -->
        <span
          class="absolute top-3 right-3 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
          :style="{ backgroundColor: cat.color + '22', color: cat.color }"
        >{{ cat.pct }}%</span>
      </button>

      <!-- No categories -->
      <div v-if="!groups.length && !categoryStore.loading" class="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Không có task nào</p>
        <p class="text-xs text-zinc-400 mt-1">Thử chọn bộ lọc khác.</p>
      </div>
    </div>

    <!-- Task detail modal/box -->
    <Transition name="modal">
      <div
        v-if="selectedCat"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="selectedCat = null" />

        <!-- Box -->
        <div
          class="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[80vh]"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0"
            :style="{ borderTopWidth: '3px', borderTopColor: selectedCat.color }"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :style="{ backgroundColor: selectedCat.color + '22', border: '1.5px solid ' + selectedCat.color + '55' }"
              >
                <CategoryIcon :icon="selectedCat.icon" size="w-5 h-5" :color="selectedCat.color" />
              </span>
              <div>
                <p class="text-sm font-bold text-zinc-800 dark:text-zinc-200">{{ selectedCat.name }}</p>
                <p class="text-[11px] text-zinc-400 tabular-nums">{{ selectedCat.done }}/{{ selectedCat.total }} completed · {{ selectedCat.pct }}%</p>
              </div>
            </div>
            <button
              @click="selectedCat = null"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="h-1 w-full bg-zinc-100 dark:bg-zinc-800 shrink-0">
            <div
              class="h-full transition-all duration-700"
              :style="{ width: selectedCat.pct + '%', backgroundColor: selectedCat.color }"
            />
          </div>

          <!-- Task list -->
          <div class="overflow-y-auto flex-1">
            <TransitionGroup name="task-row" tag="ul">
              <li
                v-for="task in sortedTasks"
                :key="task._id"
                class="group flex items-start gap-3 px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-150 cursor-pointer"
                @click="openDetail(task)"
              >
                <!-- Checkbox -->
                <button
                  @click.stop="todoStore.toggleTodo(task._id)"
                  class="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  :class="task.completed ? 'border-transparent' : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-400'"
                  :style="task.completed ? { backgroundColor: selectedCat.color, borderColor: selectedCat.color } : {}"
                >
                  <svg v-if="task.completed" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p :class="['text-sm leading-snug', task.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-200']">
                    {{ task.title }}
                  </p>
                  <div v-if="task.deadline" class="flex items-center gap-1 mt-0.5">
                    <svg class="w-3 h-3" :class="isOverdue(task) ? 'text-red-400' : 'text-zinc-400'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <span class="text-[11px]" :class="isOverdue(task) ? 'text-red-400' : 'text-zinc-400'">{{ formatDate(task.deadline) }}</span>
                  </div>
                </div>

                <!-- Priority dot -->
                <span :class="['shrink-0 mt-1.5 w-2 h-2 rounded-full', priorityColor[task.priority]]" />

                <!-- Delete -->
                <button
                  @click.stop="todoStore.deleteTodo(task._id)"
                  class="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-red-500 transition-all"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>

                <!-- Arrow hint -->
                <svg class="shrink-0 w-3.5 h-3.5 mt-1 text-zinc-200 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </li>
            </TransitionGroup>

            <!-- Empty -->
            <div v-if="!selectedCat.tasks.length" class="flex flex-col items-center justify-center py-10 text-center">
              <svg class="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-sm text-zinc-400">No tasks in this category yet.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

const emit = defineEmits<{ (e: 'click-task', task: Todo): void }>()

function openDetail(task: Todo) {
  selectedCat.value = null
  emit('click-task', task)
}

type CatGroup = {
  _id: string
  name: string
  icon: string
  color: string
  tasks: Todo[]
  done: number
  total: number
  pct: number
}

const selectedCat = ref<CatGroup | null>(null)

const priorityColor: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-green-400',
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

const sortedTasks = computed(() => {
  if (!selectedCat.value) return []
  return [...selectedCat.value.tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    // Among same completion status: high → medium → low
    return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
  })
})

const groups = computed<CatGroup[]>(() => {
  return categoryStore.categories.map(cat => {
    const tasks = todoStore.filteredTodos.filter(t => t.categoryId === cat._id)
    const done = tasks.filter(t => t.completed).length
    const total = tasks.length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { ...cat, tasks, done, total, pct }
  }).filter(g => g.total > 0)
})

// Keep selected cat in sync when todos change (e.g. after toggle/delete)
watch(
  () => todoStore.todos,
  () => {
    if (selectedCat.value) {
      const updated = groups.value.find(g => g._id === selectedCat.value!._id)
      if (updated) selectedCat.value = updated
    }
  },
  { deep: true }
)

function openCat(cat: CatGroup) {
  selectedCat.value = selectedCat.value?._id === cat._id ? null : cat
}

function isOverdue(task: Todo) {
  return !task.completed && task.deadline && new Date(task.deadline) < new Date()
}

function formatDate(d: string | null) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / 86400000)
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 0) {
    const absDiff = Math.abs(diff)
    if (absDiff < 86400000) return `Quá hạn lúc ${timeStr}`
    return `${Math.ceil(absDiff / 86400000)}d quá hạn`
  }
  if (diff < 86400000) return `Hôm nay ${timeStr}`
  if (days === 1) return `Ngày mai ${timeStr}`
  return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`
}

// Close modal on Escape key
onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') selectedCat.value = null }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease; }
.modal-leave-active .modal-box { transition: transform 0.15s ease, opacity 0.15s ease; }
.modal-enter-from .modal-box { transform: translateY(20px) scale(0.97); opacity: 0; }
.modal-leave-to .modal-box { transform: translateY(10px) scale(0.97); opacity: 0; }
.task-row-enter-active, .task-row-leave-active { transition: all 0.2s ease; }
.task-row-enter-from, .task-row-leave-to { opacity: 0; transform: translateX(-8px); }
.task-row-move { transition: transform 0.2s ease; }
</style>
