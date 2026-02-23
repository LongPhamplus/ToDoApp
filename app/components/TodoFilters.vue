<template>
  <div class="space-y-3">

    <!-- ─── Search + Sort row ───────────────────────────────────────────── -->
    <div class="flex items-center gap-2">

      <!-- Search -->
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
        </svg>
        <input
          v-model="localSearch"
          @input="onSearchInput"
          type="search"
          placeholder="Search tasks…"
          class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
        />
        <button
          v-if="localSearch"
          @click="clearSearch"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Priority filter -->
      <select
        :value="todoStore.filters.priority"
        @change="todoStore.setFilter({ priority: ($event.target as HTMLSelectElement).value as any })"
        class="text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-2 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 cursor-pointer"
      >
        <option value="all">All priorities</option>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      <!-- Category filter -->
      <select
        v-if="categoryStore.categories.length"
        :value="todoStore.filters.categoryId"
        @change="todoStore.setFilter({ categoryId: ($event.target as HTMLSelectElement).value })"
        class="hidden sm:block text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-2 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 cursor-pointer"
      >
        <option value="all">All categories</option>
        <option v-for="cat in categoryStore.categories" :key="cat._id" :value="cat._id">
          {{ cat.name }}
        </option>
      </select>

      <!-- Sort button -->
      <button
        @click="cycleSortBy"
        :title="`Sort by: ${sortLabel}`"
        class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
      >
        <svg class="w-3.5 h-3.5 shrink-0" :class="todoStore.filters.sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="transition: transform 0.2s ease">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
        </svg>
        <span class="hidden sm:inline text-xs">{{ sortLabel }}</span>
      </button>

      <!-- Sort order toggle (asc/desc) -->
      <button
        @click="todoStore.setFilter({ sortOrder: todoStore.filters.sortOrder === 'asc' ? 'desc' : 'asc' })"
        :title="todoStore.filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'"
        class="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
      >
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="todoStore.filters.sortOrder === 'asc' ? '' : 'rotate-180'"
          fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
        </svg>
      </button>
    </div>

    <!-- ─── Status tab slider ─────────────────────────────────────────────── -->
    <div class="relative flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 w-fit">
      <!-- Animated pill -->
      <span
        class="absolute top-0.5 bottom-0.5 rounded-[10px] bg-white dark:bg-zinc-700 shadow-sm transition-all duration-200 ease-out"
        :style="pillStyle"
        aria-hidden="true"
      />
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :ref="el => { if (el) tabRefs[tab.value] = el as HTMLElement }"
        @click="setStatus(tab.value)"
        :class="[
          'relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-[10px] transition-colors duration-200 whitespace-nowrap',
          todoStore.filters.status === tab.value
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
        ]"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          :class="[
            'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full tabular-nums transition-colors duration-200',
            todoStore.filters.status === tab.value
              ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400',
          ]"
        >{{ tab.count }}</span>
      </button>
    </div>

    <!-- Active filter chips ─────────────────────────────────────────────── -->
    <div v-if="activeChips.length" class="flex flex-wrap gap-1.5">
      <span
        v-for="chip in activeChips"
        :key="chip.key"
        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"
      >
        {{ chip.label }}
        <button @click="chip.clear()" class="hover:text-indigo-800 dark:hover:text-indigo-200 ml-0.5 transition-colors">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </span>

      <button
        @click="clearAllFilters"
        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-150"
      >
        Clear all
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { FilterStatus } from '~/types/todo'

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

// ── Search debounce ─────────────────────────────────────────────────────────
const localSearch = ref(todoStore.filters.search)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    todoStore.setFilter({ search: localSearch.value })
  }, 250)
}

function clearSearch() {
  localSearch.value = ''
  todoStore.setFilter({ search: '' })
}

// ── Status tabs ─────────────────────────────────────────────────────────────
const tabs = computed(() => [
  { value: 'all' as FilterStatus,       label: 'All',       count: todoStore.stats.total },
  { value: 'active' as FilterStatus,    label: 'Active',    count: todoStore.stats.active },
  { value: 'completed' as FilterStatus, label: 'Completed', count: todoStore.stats.completed },
])

const tabRefs = reactive<Record<string, HTMLElement>>({})

const pillStyle = computed(() => {
  const el = tabRefs[todoStore.filters.status]
  if (!el) return {}
  return {
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
  }
})

function setStatus(val: FilterStatus) {
  todoStore.setFilter({ status: val })
  nextTick(() => {
    // ensure pill updates after DOM
  })
}

// ── Sort ────────────────────────────────────────────────────────────────────
const sortOptions = ['createdAt', 'deadline', 'priority', 'title'] as const

const sortLabelMap: Record<string, string> = {
  createdAt: 'Date',
  deadline: 'Deadline',
  priority: 'Priority',
  title: 'Name',
}
const sortLabel = computed(() => sortLabelMap[todoStore.filters.sortBy] ?? 'Date')

function cycleSortBy() {
  const idx = sortOptions.indexOf(todoStore.filters.sortBy as any)
  const next = sortOptions[(idx + 1) % sortOptions.length]
  todoStore.setFilter({ sortBy: next })
}

// ── Active filter chips ─────────────────────────────────────────────────────
const activeChips = computed(() => {
  const chips: { key: string; label: string; clear: () => void }[] = []

  if (todoStore.filters.priority !== 'all') {
    const p = todoStore.filters.priority
    chips.push({
      key: 'priority',
      label: `Priority: ${p.charAt(0).toUpperCase() + p.slice(1)}`,
      clear: () => todoStore.setFilter({ priority: 'all' }),
    })
  }

  if (todoStore.filters.categoryId !== 'all') {
    const cat = categoryStore.getCategoryById(todoStore.filters.categoryId)
    chips.push({
      key: 'category',
      label: cat?.name ?? 'Category',
      clear: () => todoStore.setFilter({ categoryId: 'all' }),
    })
  }

  if (todoStore.filters.search.trim()) {
    chips.push({
      key: 'search',
      label: `"${todoStore.filters.search}"`,
      clear: clearSearch,
    })
  }

  return chips
})

function clearAllFilters() {
  localSearch.value = ''
  todoStore.setFilter({
    search: '',
    status: 'all',
    priority: 'all',
    categoryId: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
}

// Keep local search in sync if store changes externally
watch(() => todoStore.filters.search, (v) => { localSearch.value = v })
</script>
