<template>
  <section v-if="tasks.length">
    <!-- Group Header -->
    <div class="flex items-center gap-2 mb-2">
      <span :class="[
        'text-xs font-semibold uppercase tracking-widest',
        accent === 'red' ? 'text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400',
      ]">{{ label }}</span>
      <span :class="[
        'text-[11px] tabular-nums px-1.5 py-0.5 rounded-full font-medium',
        accent === 'red'
          ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
      ]">{{ tasks.filter(t => !t.completed).length }}</span>
      <div class="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
    </div>

    <!-- Task list with animated transitions -->
    <TransitionGroup
      tag="div"
      name="list"
      class="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]"
    >
      <TaskItem
        v-for="task in tasks"
        :key="task._id"
        :task="task"
        :accent="accent"
        @toggle="$emit('toggle', task._id)"
        @delete="$emit('delete', task._id)"
      />
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

defineProps<{
  label: string
  accent: 'red' | 'default'
  tasks: Todo[]
}>()

defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
}>()
</script>

<style scoped>
.list-move { transition: transform 0.3s ease; }
.list-enter-active { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.list-leave-active { transition: all 0.2s ease; }
.list-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
.list-leave-to { opacity: 0; transform: translateX(-16px); }
</style>
