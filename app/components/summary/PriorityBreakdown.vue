<template>
  <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
    <h3 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-5">Priority Breakdown</h3>

    <!-- Donut SVG -->
    <div class="flex items-center gap-6">
      <div class="relative shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96" class="-rotate-90">
          <circle cx="48" cy="48" r="36" fill="none" stroke-width="12" class="stroke-zinc-100 dark:stroke-zinc-800" />
          <circle v-for="seg in segments" :key="seg.label"
            cx="48" cy="48" r="36" fill="none" stroke-width="12"
            :stroke="seg.color"
            :stroke-dasharray="`${seg.dash} ${circumference}`"
            :stroke-dashoffset="-seg.offset"
            stroke-linecap="butt"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xl font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">{{ total }}</span>
          <span class="text-[10px] text-zinc-400">tasks</span>
        </div>
      </div>

      <div class="flex-1 space-y-2.5">
        <div v-for="seg in segments" :key="seg.label" class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
          <span class="text-xs text-zinc-600 dark:text-zinc-400 flex-1">{{ seg.label }}</span>
          <span class="text-xs font-semibold tabular-nums" :style="{ color: seg.color }">{{ seg.count }}</span>
          <span class="text-[11px] text-zinc-400 w-7 text-right">{{ seg.pct }}%</span>
        </div>
      </div>
    </div>

    <!-- Completed vs Active -->
    <div class="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
      <p class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</p>
      <div class="flex h-3 rounded-full overflow-hidden">
        <div class="bg-indigo-500 transition-all duration-700" :style="{ width: `${completedPct}%` }" />
        <div class="bg-zinc-200 dark:bg-zinc-700 flex-1" />
      </div>
      <div class="flex items-center justify-between text-xs text-zinc-400 tabular-nums">
        <span><span class="text-indigo-500 font-medium">{{ completed }}</span> completed</span>
        <span>{{ completedPct }}%</span>
        <span><span class="text-zinc-600 dark:text-zinc-300 font-medium">{{ active }}</span> active</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const todoStore = useTodoStore()

const RADIUS = 36
const circumference = 2 * Math.PI * RADIUS

const total    = computed(() => todoStore.todos.length)
const completed = computed(() => todoStore.todos.filter(t => t.completed).length)
const active   = computed(() => todoStore.todos.filter(t => !t.completed).length)
const completedPct = computed(() => total.value ? Math.round((completed.value / total.value) * 100) : 0)

const counts = computed(() => ({
  high:   todoStore.todos.filter(t => t.priority === 'high').length,
  medium: todoStore.todos.filter(t => t.priority === 'medium').length,
  low:    todoStore.todos.filter(t => t.priority === 'low').length,
}))

const segments = computed(() => {
  const t = total.value || 1
  let offset = 0
  return [
    { label: 'High',   color: '#f87171', count: counts.value.high,   pct: Math.round((counts.value.high / t) * 100) },
    { label: 'Medium', color: '#fbbf24', count: counts.value.medium, pct: Math.round((counts.value.medium / t) * 100) },
    { label: 'Low',    color: '#4ade80', count: counts.value.low,    pct: Math.round((counts.value.low / t) * 100) },
  ].map(seg => {
    const dash = (seg.count / t) * circumference
    const o = offset
    offset += dash
    return { ...seg, dash, offset: o }
  })
})
</script>
