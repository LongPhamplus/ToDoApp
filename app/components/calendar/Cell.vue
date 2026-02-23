<template>
  <div
    class="relative p-1.5 rounded-xl border transition-all duration-150 cursor-pointer select-none"
    :class="[
      isCurrentMonth !== false
        ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
        : 'bg-zinc-50/60 dark:bg-zinc-950/60 border-zinc-100/50 dark:border-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-700',
      isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900' : '',
    ]"
    :style="compact ? 'min-height: 0' : 'min-height: 90px'"
    @click="handleCellClick"
  >
    <!-- Day number -->
    <div class="flex items-center justify-between mb-1">
      <span
        class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
        :class="[
          isToday
            ? 'bg-indigo-500 text-white'
            : isCurrentMonth !== false
              ? 'text-zinc-700 dark:text-zinc-300'
              : 'text-zinc-400 dark:text-zinc-600',
        ]"
      >{{ dayNum }}</span>

      <div class="flex items-center gap-1">
        <!-- Holiday indicator dot (non-compact) -->
        <span v-if="!compact && holidays?.length" class="w-1.5 h-1.5 rounded-full bg-red-400" title="Public holiday" />
        <span v-if="tasks.length && !compact" class="text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
          {{ tasks.length }}
        </span>
      </div>
    </div>

    <!-- Holiday chips (non-compact) -->
    <div v-if="!compact && holidays?.length" class="flex flex-col gap-0.5 mb-0.5">
      <CalendarHolidayChip
        v-for="h in holidays"
        :key="h.date + h.localName"
        :holiday="h"
      />
    </div>

    <!-- Event chips (non-compact only) -->
    <div v-if="!compact" class="flex flex-col gap-0.5">
      <CalendarEventChip
        v-for="task in visibleTasks"
        :key="task._id"
        :task="task"
        :category-color="categoryColor(task)"
        @click.stop="$emit('click-task', task)"
      />
      <button
        v-if="overflow > 0"
        @click.stop="$emit('show-more', tasks)"
        class="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-left pl-1 transition-colors"
      >
        +{{ overflow }} more
      </button>
    </div>

    <!-- Compact: dot indicator -->
    <div v-if="compact && (tasks.length || holidays?.length)" class="flex justify-center gap-0.5 mt-0.5">
      <!-- Holiday dot -->
      <span v-if="holidays?.length" class="w-1.5 h-1.5 rounded-full bg-red-400" />
      <span
        v-for="(t, i) in tasks.slice(0, 3)"
        :key="i"
        class="w-1.5 h-1.5 rounded-full"
        :style="{ backgroundColor: categoryColor(t) || '#6366f1' }"
      />
      <span v-if="tasks.length > 3" class="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'
import type { Holiday } from '~/composables/useHolidays'

const props = defineProps<{
  date: Date
  tasks: Todo[]
  holidays?: Holiday[]
  isToday?: boolean
  isCurrentMonth?: boolean
  maxVisible?: number
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'click-task', task: Todo): void
  (e: 'show-more', tasks: Todo[]): void
  (e: 'click-day', date: Date, tasks: Todo[]): void
}>()

const categoryStore = useCategoryStore()

const max = computed(() => props.maxVisible ?? 3)
const visibleTasks = computed(() => props.tasks.slice(0, max.value))
const overflow = computed(() => Math.max(0, props.tasks.length - max.value))
const dayNum = computed(() => props.date.getDate())

function categoryColor(task: Todo): string | undefined {
  if (!task.categoryId) return undefined
  return categoryStore.getCategoryById(task.categoryId as string)?.color
}

function handleCellClick() {
  // Always emit click-day so View can open the day dialog
  emit('click-day', props.date, props.tasks)
}
</script>
