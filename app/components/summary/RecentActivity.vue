<template>
  <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
    <h3 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-5">Recent Activity</h3>

    <div v-if="!recentTasks.length" class="text-center py-6 text-xs text-zinc-400">No tasks yet</div>

    <ul v-else class="space-y-0">
      <li
        v-for="task in recentTasks"
        :key="task._id"
        class="flex items-start gap-3 py-3 border-b border-zinc-50 dark:border-zinc-800 last:border-0"
      >
        <!-- Status dot -->
        <span
          :class="['mt-1.5 shrink-0 w-2 h-2 rounded-full', task.completed ? 'bg-green-400' : isOverdue(task) ? 'bg-red-400' : 'bg-indigo-400']"
        />

        <div class="flex-1 min-w-0">
          <p :class="['text-sm leading-snug', task.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300']">{{ task.title }}</p>
          <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span v-if="getCat(task.categoryId)" class="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md" :style="{ backgroundColor: getCat(task.categoryId)!.color + '20', color: getCat(task.categoryId)!.color }">
              <CategoryIcon :icon="getCat(task.categoryId)!.icon" size="w-3 h-3" :color="getCat(task.categoryId)!.color" />
              {{ getCat(task.categoryId)!.name }}
            </span>
            <span :class="['text-[11px]', priorityColor[task.priority]]">{{ task.priority }}</span>
          </div>
        </div>

        <span class="text-[11px] text-zinc-400 shrink-0 mt-0.5">{{ timeAgo(task.createdAt) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

const recentTasks = computed(() =>
  [...todoStore.todos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8),
)

function getCat(id: string) {
  return categoryStore.getCategoryById(id)
}

function isOverdue(t: Todo) {
  return !t.completed && !!t.deadline && new Date(t.deadline) < new Date()
}

const priorityColor: Record<string, string> = {
  high: 'text-red-400', medium: 'text-amber-400', low: 'text-green-400',
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
