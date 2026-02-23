<template>
  <div class="min-h-full py-8 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- ─── Page Header ──────────────────────────────────────────────── -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Tasks</h1>
          <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {{ todoStore.stats.active }} active · {{ todoStore.stats.completed }} completed · {{ todoStore.stats.overdue }} overdue
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Filter chips -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="f in filterOptions" :key="f.value"
              @click="activeFilter = f.value"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                activeFilter === f.value
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
              ]"
            >{{ f.label }}</button>
          </div>

          <!-- Cleanup button -->
          <button
            @click="cleanupOpen = true"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-600 hover:border-red-300 dark:hover:border-red-500/50 dark:hover:text-red-400 transition-all duration-200"
            title="Dọn dẹp tasks"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Dọn dẹp
          </button>
        </div>
      </div>

      <!-- ─── Notification Banner ──────────────────────────────────────── -->
      <NotificationManager />

      <!-- ─── Stats overview ───────────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="stat in statCards" :key="stat.label"
          class="flex flex-col gap-0.5 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
          <span class="text-xl font-bold tabular-nums" :class="stat.color">{{ stat.value }}</span>
          <span class="text-[11px] text-zinc-400">{{ stat.label }}</span>
        </div>
      </div>

      <!-- ─── Loading skeleton ─────────────────────────────────────────── -->
      <div v-if="todoStore.loading || categoryStore.loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>

      <!-- ─── Task list by category ────────────────────────────────────── -->
      <TasksListByCategory
        v-else
        @click-task="openDetail"
      />

    </div>

    <!-- ─── Floating Create Button ───────────────────────────────────── -->
    <TasksCreateForm />

    <!-- ─── Detail Modal ─────────────────────────────────────────────── -->
    <TasksDetailModal v-model="detailOpen" :task="selectedTask" />

    <!-- ─── Cleanup Modal ────────────────────────────────────────────── -->
    <TasksCleanupModal v-model="cleanupOpen" @done="onCleanupDone" />
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

useHead({ title: 'Tasks — Focus' })

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
  await Promise.all([todoStore.fetchTodos(), categoryStore.fetchCategories()])
})

// ── Filter ──────────────────────────────────────────────────────────────────
const activeFilter = ref<'all' | 'active' | 'completed' | 'overdue'>('all')

const filterOptions = [
  { value: 'all',       label: 'All' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue',   label: 'Overdue' },
] as const

watch(activeFilter, (v) => {
  todoStore.setFilter({ status: v })
})

// ── Stat cards ──────────────────────────────────────────────────────────────
const statCards = computed(() => [
  { label: 'Total',     value: todoStore.stats.total,     color: 'text-zinc-700 dark:text-zinc-200' },
  { label: 'Active',    value: todoStore.stats.active,    color: 'text-indigo-500' },
  { label: 'Done',      value: todoStore.stats.completed, color: 'text-green-500' },
  { label: 'Overdue',   value: todoStore.stats.overdue,   color: 'text-red-500' },
])

// ── Detail modal ────────────────────────────────────────────────────────────
const detailOpen = ref(false)
const selectedTask = ref<Todo | null>(null)

function openDetail(task: Todo) {
  selectedTask.value = task
  detailOpen.value = true
}

// ── Cleanup modal ────────────────────────────────────────────────────────────
const cleanupOpen = ref(false)

function onCleanupDone(deleted: number) {
  useToast().add({
    title: 'Dọn dẹp hoàn tất',
    description: `Đã xóa ${deleted} task thành công.`,
    color: 'success',
    duration: 4000,
  })
}
</script>
