<template>
  <button
    :class="[
      'group flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-sm transition-all duration-200 relative',
      active
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
      collapsed ? 'justify-center' : '',
    ]"
    :title="collapsed ? item.label : undefined"
  >
    <!-- Icon -->
    <span
      :class="['shrink-0 w-4 h-4 transition-colors duration-200', active ? 'text-indigo-500' : '']"
      v-html="item.icon"
    />

    <!-- Label + count (hidden when collapsed) -->
    <span
      :class="[
        'flex items-center justify-between flex-1 whitespace-nowrap overflow-hidden transition-all duration-200',
        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
      ]"
    >
      <span>{{ item.label }}</span>
      <span
        v-if="item.count"
        class="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500 ml-1"
      >
        {{ item.count }}
      </span>
    </span>

    <!-- Tooltip when collapsed -->
    <span
      v-if="collapsed"
      class="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-700 px-2 py-1 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
    >
      {{ item.label }}
      <span v-if="item.count" class="ml-1 text-zinc-400">{{ item.count }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
interface NavItem {
  id: string
  label: string
  icon: string
  count?: number
}

defineProps<{
  item: NavItem
  collapsed: boolean
  active: boolean
}>()
</script>
