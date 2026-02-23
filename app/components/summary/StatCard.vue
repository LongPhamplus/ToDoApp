<template>
  <div
    class="flex flex-col gap-1 px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    :class="highlight ? 'ring-1 ring-inset' : ''"
    :style="highlight ? { ringColor: color + '40' } : {}"
  >
    <div class="flex items-start justify-between">
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mb-2"
        :style="{ backgroundColor: color + '18' }"
      >
        <span class="text-lg">{{ icon }}</span>
      </div>
      <span v-if="trend !== undefined"
        :class="['text-xs font-medium tabular-nums', trend >= 0 ? 'text-green-500' : 'text-red-400']"
      >{{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%</span>
    </div>
    <span class="text-2xl font-bold tabular-nums" :style="{ color }">{{ value }}</span>
    <span class="text-xs text-zinc-400">{{ label }}</span>
    <p v-if="sub" class="text-[11px] text-zinc-400 mt-0.5">{{ sub }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: number | string
  color?: string
  sub?: string
  trend?: number
  highlight?: boolean
}>()
</script>
