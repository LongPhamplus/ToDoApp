<template>
  <div
    class="group relative flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-150"
  >
    <!-- Custom Checkbox -->
    <button
      @click="$emit('toggle')"
      :class="[
        'mt-0.5 shrink-0 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-200',
        task.completed
          ? 'bg-indigo-500 border-indigo-500 shadow-sm'
          : accent === 'red'
            ? 'border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-500'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500',
      ]"
      :aria-label="task.completed ? 'Mark incomplete' : 'Mark complete'"
    >
      <svg v-if="task.completed" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <!-- Task Body -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span :class="[
          'text-sm transition-all duration-200',
          task.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100',
        ]">{{ task.title }}</span>

        <!-- Category chip -->
        <span v-if="categoryName && !task.completed"
          class="hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-all duration-200"
          :style="{ borderColor: categoryColor + '40', backgroundColor: categoryColor + '15', color: categoryColor }">
          {{ categoryName }}
        </span>
      </div>

      <!-- Sub-row: priority + deadline -->
      <div class="mt-0.5 flex items-center gap-3">
        <!-- Priority dot -->
        <div v-if="!task.completed" class="flex items-center gap-1">
          <span :class="[
            'w-1.5 h-1.5 rounded-full',
            task.priority === 'high' ? 'bg-red-500' :
            task.priority === 'medium' ? 'bg-amber-400' : 'bg-zinc-300 dark:bg-zinc-600',
          ]" />
          <span class="text-[10px] text-zinc-400 capitalize">{{ task.priority }}</span>
        </div>

        <!-- Deadline badge -->
        <span v-if="task.deadline && !task.completed"
          :class="[
            'text-[10px] font-medium',
            isOverdue ? 'text-red-500' : 'text-zinc-400',
          ]">
          {{ deadlineLabel }}
        </span>

        <!-- Sub-tasks progress -->
        <span v-if="task.subTasks.length" class="text-[10px] text-zinc-400 tabular-nums">
          {{ task.subTasks.filter(s => s.completed).length }}/{{ task.subTasks.length }} subtasks
        </span>
      </div>
    </div>

    <!-- Hover Actions -->
    <div :class="[
      'flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0',
      task.completed ? '!opacity-0 pointer-events-none' : '',
    ]">
      <!-- Edit -->
      <button
        class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
        title="Edit" @click="$emit('edit')">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <!-- Date -->
      <button
        class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
        title="Set date">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <!-- Delete -->
      <button
        @click="$emit('delete')"
        class="p-1.5 rounded-md text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
        title="Delete">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

const props = defineProps<{
  task: Todo
  accent: 'red' | 'default'
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'delete'): void
  (e: 'edit'): void
}>()

const categoryStore = useCategoryStore()

const category = computed(() => categoryStore.getCategoryById(props.task.categoryId))
const categoryName = computed(() => category.value?.name ?? '')
const categoryColor = computed(() => category.value?.color ?? '#6366f1')

const isOverdue = computed(() =>
  !!props.task.deadline && new Date(props.task.deadline) < new Date(),
)

const deadlineLabel = computed(() => {
  if (!props.task.deadline) return ''
  const d = new Date(props.task.deadline)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.floor(diff / 86400000)
  const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 0) {
    const absDiff = Math.abs(diff)
    if (absDiff < 86400000) return `Quá hạn lúc ${timeStr}`
    return `${Math.ceil(absDiff / 86400000)}d overdue`
  }
  if (diff < 86400000) return `Hôm nay ${timeStr}`
  if (days === 1) return `Ngày mai ${timeStr}`
  return `${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`
})
</script>