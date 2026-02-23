<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <TransitionGroup name="card">

      <!-- Category cards -->
      <div
        v-for="cat in categoryStore.categories"
        :key="cat._id"
        class="group relative flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
      >
        <!-- Color stripe -->
        <div class="absolute inset-x-0 top-0 h-1 rounded-t-2xl" :style="{ backgroundColor: cat.color }" />

        <!-- Header -->
        <div class="flex items-start justify-between pt-1">
          <div class="flex items-center gap-3">
            <span
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: cat.color + '22', border: `1.5px solid ${cat.color}44` }"
            >
              <UIcon :name="cat.icon || 'i-mdi-folder'" class="w-5 h-5" :style="{ color: cat.color }" />
            </span>
            <div>
              <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ cat.name }}</p>
              <p class="text-[11px] font-mono text-zinc-400">{{ cat.color }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', cat._id)" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button v-if="!cat.isDefault" @click="$emit('delete', cat._id, cat.name)" class="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-500">{{ taskCounts[cat._id]?.done ?? 0 }} / {{ taskCounts[cat._id]?.total ?? 0 }} tasks</span>
            <span class="tabular-nums font-medium" :style="{ color: cat.color }">{{ taskCounts[cat._id]?.pct ?? 0 }}%</span>
          </div>
          <div class="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: `${taskCounts[cat._id]?.pct ?? 0}%`, backgroundColor: cat.color }"
            />
          </div>
        </div>

        <!-- Priority breakdown -->
        <div class="flex items-center gap-2 pt-0.5">
          <span v-for="p in priorityBreakdown(cat._id)" :key="p.label"
            class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"
            :class="p.class"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="p.dot" />
            {{ p.count }} {{ p.label }}
          </span>
        </div>

        <!-- Default badge -->
        <div v-if="cat.isDefault" class="absolute bottom-3 right-3">
          <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-medium">Default</span>
        </div>
      </div>

      <!-- Add new card -->
      <button
        key="add-new"
        @click="$emit('create')"
        class="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-600 text-zinc-400 hover:text-indigo-500 transition-all duration-200 group min-h-[140px]"
      >
        <div class="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 flex items-center justify-center transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <span class="text-sm font-medium">New Category</span>
      </button>

    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string, name: string): void
  (e: 'create'): void
}>()

const categoryStore = useCategoryStore()
const todoStore = useTodoStore()

const taskCounts = computed(() => {
  const map: Record<string, { total: number; done: number; pct: number }> = {}
  categoryStore.categories.forEach(cat => {
    const tasks = todoStore.todos.filter(t => t.categoryId === cat._id)
    const done = tasks.filter(t => t.completed).length
    const total = tasks.length
    map[cat._id] = { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  })
  return map
})

function priorityBreakdown(catId: string) {
  const tasks = todoStore.todos.filter(t => t.categoryId === catId)
  return [
    { label: 'high',   count: tasks.filter(t => t.priority === 'high').length,   class: 'bg-red-50 dark:bg-red-500/10 text-red-500',    dot: 'bg-red-400' },
    { label: 'med',    count: tasks.filter(t => t.priority === 'medium').length, class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500', dot: 'bg-amber-400' },
    { label: 'low',    count: tasks.filter(t => t.priority === 'low').length,    class: 'bg-green-50 dark:bg-green-500/10 text-green-500', dot: 'bg-green-400' },
  ].filter(p => p.count > 0)
}
</script>

<style scoped>
.card-enter-active, .card-leave-active { transition: all 0.25s ease; }
.card-enter-from, .card-leave-to { opacity: 0; transform: scale(0.95); }
.card-move { transition: transform 0.25s ease; }
</style>
