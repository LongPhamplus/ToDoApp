<template>
  <div class="min-h-full py-8 px-4 sm:px-6">
    <div class="max-w-5xl mx-auto space-y-6">

      <!-- ─── Page Header ──────────────────────────────────────────────── -->
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Summary</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Overview of all your tasks and progress</p>
      </div>

      <!-- ─── Loading ──────────────────────────────────────────────────── -->
      <div v-if="todoStore.loading" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>

      <template v-else>

        <!-- ─── Stat Cards row ───────────────────────────────────────── -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryStatCard icon="📋" label="Total Tasks"   :value="todoStore.stats.total"     color="#6366f1" />
          <SummaryStatCard icon="✅" label="Completed"     :value="todoStore.stats.completed" color="#22c55e" />
          <SummaryStatCard icon="⏳" label="Active"        :value="todoStore.stats.active"    color="#3b82f6" />
          <SummaryStatCard icon="🚨" label="Overdue"       :value="todoStore.stats.overdue"   color="#ef4444" :highlight="todoStore.stats.overdue > 0" />
        </div>

        <!-- ─── Today progress ───────────────────────────────────────── -->
        <div class="flex items-center gap-4 px-5 py-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5">
          <!-- Ring -->
          <div class="relative w-14 h-14 shrink-0">
            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke-width="4" class="stroke-indigo-100 dark:stroke-indigo-900" />
              <circle cx="28" cy="28" r="22" fill="none" stroke-width="4" stroke-linecap="round"
                class="stroke-indigo-500 transition-all duration-700"
                :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {{ todayPct }}%
            </span>
          </div>
          <div>
            <p class="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Today's Progress</p>
            <p class="text-xs text-indigo-500 dark:text-indigo-400">{{ todoStore.stats.todayDone }} of {{ todoStore.stats.todayTotal }} tasks done today</p>
          </div>
        </div>

        <!-- ─── 2-col charts ─────────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SummaryProgressChart />
          <SummaryPriorityBreakdown />
        </div>

        <!-- ─── Full-width recent activity ──────────────────────────── -->
        <SummaryRecentActivity />

      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Summary — Focus' })

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
  await Promise.all([todoStore.fetchTodos(), categoryStore.fetchCategories()])
})

const RADIUS = 22
const circumference = 2 * Math.PI * RADIUS

const todayPct = computed(() => {
  const { todayTotal, todayDone } = todoStore.stats
  return todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100)
})
const dashOffset = computed(() => circumference * (1 - todayPct.value / 100))
</script>
