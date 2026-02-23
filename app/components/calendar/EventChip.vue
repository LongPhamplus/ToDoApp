<template>
  <button
    class="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium truncate max-w-full w-full text-left transition-all hover:opacity-80"
    :class="task.completed ? 'opacity-50 line-through cursor-default' : 'cursor-pointer'"
    :style="{ backgroundColor: bgColor, color: textColor }"
    :title="task.title"
    @click.stop="$emit('click', task)"
  >
    <span
      v-if="task.priority && !task.completed"
      class="shrink-0 w-1.5 h-1.5 rounded-full"
      :class="priorityDot"
    />
    <span class="truncate">{{ task.title }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

const props = defineProps<{ task: Todo; categoryColor?: string }>()
defineEmits<{ (e: 'click', task: Todo): void }>()

const bgColor = computed(() => {
  const base = props.categoryColor || '#6366f1'
  return hexToRgba(base, 0.15)
})
const textColor = computed(() => props.categoryColor || '#6366f1')

const priorityDot = computed(() => ({
  high:   'bg-red-500',
  medium: 'bg-yellow-500',
  low:    'bg-blue-400',
}[props.task.priority ?? 'low'] ?? 'bg-zinc-400'))

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
</script>
