<template>
  <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
    <h3 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-5">Progress by Category</h3>

    <div v-if="!rows.length" class="text-center py-6 text-xs text-zinc-400">No data yet</div>

    <div v-else class="space-y-4">
      <div v-for="row in rows" :key="row._id" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CategoryIcon :icon="row.icon" size="w-4 h-4" :color="row.color" />
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">{{ row.name }}</span>
          </div>
          <div class="flex items-center gap-2 text-xs tabular-nums">
            <span class="text-zinc-400">{{ row.done }}/{{ row.total }}</span>
            <span class="font-semibold" :style="{ color: row.color }">{{ row.pct }}%</span>
          </div>
        </div>
        <div class="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: `${row.pct}%`, backgroundColor: row.color }"
          />
        </div>
        <!-- Priority mini-bar -->
        <div class="flex h-1 rounded-full overflow-hidden gap-px">
          <div v-if="row.highCount" class="bg-red-400 transition-all duration-500" :style="{ flex: row.highCount }" />
          <div v-if="row.medCount" class="bg-amber-400 transition-all duration-500" :style="{ flex: row.medCount }" />
          <div v-if="row.lowCount" class="bg-green-400 transition-all duration-500" :style="{ flex: row.lowCount }" />
          <div v-if="row.total === 0" class="bg-zinc-200 dark:bg-zinc-700" style="flex:1" />
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5 text-[11px] text-zinc-400">
        <span class="w-2 h-2 rounded-full" :class="item.color" />
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const categoryStore = useCategoryStore()
const todoStore = useTodoStore()

const rows = computed(() =>
  categoryStore.categories.map(cat => {
    const tasks = todoStore.todos.filter(t => t.categoryId === cat._id)
    const done = tasks.filter(t => t.completed).length
    const total = tasks.length
    return {
      ...cat,
      tasks,
      done,
      total,
      pct: total ? Math.round((done / total) * 100) : 0,
      highCount: tasks.filter(t => t.priority === 'high').length,
      medCount:  tasks.filter(t => t.priority === 'medium').length,
      lowCount:  tasks.filter(t => t.priority === 'low').length,
    }
  }).filter(r => r.total > 0)
)

const legend = [
  { label: 'High',   color: 'bg-red-400' },
  { label: 'Medium', color: 'bg-amber-400' },
  { label: 'Low',    color: 'bg-green-400' },
]
</script>
