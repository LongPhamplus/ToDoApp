<template>
  <div class="min-h-full bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20">

    <!-- ═══════════════════════════════════════════════════════════
         HERO HEADER — Greeting + Clock + Weather + Holiday
    ════════════════════════════════════════════════════════════ -->
    <div class="relative overflow-hidden">
      <!-- Subtle bg decoration -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-100/40 dark:bg-indigo-500/5 blur-3xl" />
        <div class="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-violet-100/30 dark:bg-violet-500/5 blur-3xl" />
      </div>

      <div class="relative px-6 pt-8 pb-6 max-w-5xl mx-auto">

        <!-- Holiday Alert Banner -->
        <Transition name="slide-down">
          <div
            v-if="todayHolidays.length"
            class="mb-5 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
          >
            <span class="text-lg">🇻🇳</span>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-semibold text-red-700 dark:text-red-400">
                {{ todayHolidays.map(h => h.localName).join(' · ') }}
              </span>
              <span class="ml-2 text-xs text-red-500/70 dark:text-red-400/60">Ngày lễ quốc gia</span>
            </div>
            <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
              Public Holiday
            </span>
          </div>
        </Transition>

        <!-- Main header row -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

          <!-- Left: Greeting + Date -->
          <div class="space-y-1">
            <!-- Greeting -->
            <p class="text-sm font-medium text-zinc-400 dark:text-zinc-500 tracking-wide">
              {{ greetingEmoji }} {{ greeting }}
            </p>
            <!-- User name -->
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {{ authStore.user?.name?.split(' ')[0] ?? 'there' }}
            </h1>
            <!-- Full date -->
            <p class="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              {{ fullDate }}
            </p>
          </div>

          <!-- Right: Clock + Weather -->
          <div class="flex items-start gap-3">
            <!-- Live clock -->
            <div class="flex flex-col items-end">
              <span class="text-4xl sm:text-5xl font-bold tracking-tighter tabular-nums text-zinc-900 dark:text-zinc-100 leading-none">
                {{ clockTime }}
              </span>
              <span class="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-widest">
                {{ clockAmPm }}
              </span>
            </div>

            <!-- Divider -->
            <div class="self-stretch w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <!-- Weather pill (mock) -->
            <div class="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm">
              <span class="text-2xl">{{ weather.icon }}</span>
              <span class="text-xl font-bold text-zinc-800 dark:text-zinc-200 leading-none">{{ weather.temp }}</span>
              <span class="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide whitespace-nowrap">{{ weather.condition }}</span>
            </div>
          </div>
        </div>

        <!-- Progress summary strip -->
        <div class="mt-6 flex items-center gap-4 flex-wrap">
          <div
            v-for="chip in summaryChips"
            :key="chip.label"
            class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
            :class="chip.class"
          >
            <span v-html="chip.icon" />
            {{ chip.value }} {{ chip.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         MAIN CONTENT — 2-column grid
    ════════════════════════════════════════════════════════════ -->
    <div class="px-6 pb-10 max-w-5xl mx-auto mt-2">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        <!-- ── LEFT: Today's Focus ──────────────────────────────── -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-5 rounded-full bg-indigo-500" />
              <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Today's Focus</h2>
            </div>
            <span class="text-xs font-medium text-zinc-400">
              {{ todayDone }}/{{ todayTasks.length }} done
            </span>
          </div>

          <!-- Progress bar -->
          <div class="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              class="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
              :style="{ width: todayProgressPct + '%' }"
            />
          </div>

          <!-- Loading skeleton -->
          <div v-if="todoStore.loading" class="space-y-3">
            <div v-for="i in 4" :key="i"
              class="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="todayTasks.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <span class="text-5xl mb-4">🌿</span>
            <p class="text-base font-semibold text-zinc-700 dark:text-zinc-300">Không có task nào hôm nay</p>
            <p class="text-sm text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
              "Almost everything will work again if you unplug it for a few minutes, including you."
            </p>
            <p class="text-xs text-zinc-300 dark:text-zinc-600 mt-2">— Anne Lamott</p>
          </div>

          <!-- All done state -->
          <div
            v-else-if="todayDone === todayTasks.length && todayTasks.length > 0"
            class="flex flex-col items-center justify-center py-10 text-center rounded-2xl bg-green-50/60 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20"
          >
            <span class="text-4xl mb-3">🎉</span>
            <p class="text-base font-bold text-green-700 dark:text-green-400">Xuất sắc!</p>
            <p class="text-sm text-green-600/70 dark:text-green-400/60 mt-1">Tất cả {{ todayTasks.length }} task hôm nay đã hoàn thành.</p>
          </div>

          <!-- Task list -->
          <TransitionGroup v-else name="task-fade" tag="div" class="space-y-2.5">
            <div
              v-for="task in sortedTodayTasks"
              :key="task._id"
              class="group relative flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-200 cursor-pointer"
              :class="[
                task.completed
                  ? 'border-zinc-100 dark:border-zinc-800/60 opacity-60'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)]',
              ]"
              @click="openDetail(task)"
            >
              <!-- Priority accent bar -->
              <span
                class="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                :class="{
                  'bg-red-400': task.priority === 'high',
                  'bg-amber-400': task.priority === 'medium',
                  'bg-green-400': task.priority === 'low',
                }"
              />

              <!-- Checkbox -->
              <button
                @click.stop="todoStore.toggleTodo(task._id)"
                class="shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm"
                :class="task.completed
                  ? 'bg-indigo-500 border-indigo-500 shadow-indigo-200 dark:shadow-indigo-900'
                  : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 hover:shadow-indigo-100'"
              >
                <svg v-if="task.completed" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0 pl-1">
                <p
                  class="text-sm font-semibold leading-snug transition-colors"
                  :class="task.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-100'"
                >{{ task.title }}</p>

                <p v-if="task.description" class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                  {{ task.description }}
                </p>

                <!-- Meta row -->
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <!-- Category -->
                  <span
                    v-if="task.category"
                    class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    :style="{ backgroundColor: task.category.color + '22', color: task.category.color }"
                  >
                    <CategoryIcon :icon="task.category.icon" size="w-2.5 h-2.5" :color="task.category.color" />
                    {{ task.category.name }}
                  </span>

                  <!-- Priority -->
                  <span
                    class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                    :class="{
                      'bg-red-50 text-red-500 dark:bg-red-500/10': task.priority === 'high',
                      'bg-amber-50 text-amber-500 dark:bg-amber-500/10': task.priority === 'medium',
                      'bg-green-50 text-green-600 dark:bg-green-500/10': task.priority === 'low',
                    }"
                  >{{ task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp' }}</span>

                  <!-- Subtask progress -->
                  <span
                    v-if="task.subTasks?.length"
                    class="text-[10px] text-zinc-400 dark:text-zinc-500"
                  >
                    {{ task.subTasks.filter(s => s.completed).length }}/{{ task.subTasks.length }} subtasks
                  </span>
                </div>
              </div>

              <!-- Arrow -->
              <svg class="shrink-0 w-4 h-4 text-zinc-200 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors mt-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </TransitionGroup>
        </div>

        <!-- ── RIGHT: Upcoming + Mini Calendar ──────────────────── -->
        <div class="space-y-5 lg:sticky lg:top-6">

          <!-- Upcoming Deadlines -->
          <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-1.5 h-4 rounded-full bg-amber-400" />
              <h3 class="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">Sắp đến hạn</h3>
              <span class="ml-auto text-[10px] font-medium text-zinc-400">3 ngày tới</span>
            </div>

            <div v-if="upcomingTasks.length === 0"
              class="flex flex-col items-center justify-center py-6 text-center"
            >
              <span class="text-3xl mb-2">✨</span>
              <p class="text-xs text-zinc-400">Không có deadline sắp tới</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="task in upcomingTasks"
                :key="task._id"
                class="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150 group"
                :class="isUrgent(task)
                  ? 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/15'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'"
                @click="openDetail(task)"
              >
                <!-- Urgency dot -->
                <span
                  class="shrink-0 mt-1 w-2 h-2 rounded-full"
                  :class="isUrgent(task) ? 'bg-amber-400' : 'bg-zinc-300 dark:bg-zinc-600'"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold truncate"
                    :class="isUrgent(task) ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'"
                  >{{ task.title }}</p>
                  <p class="text-[10px] mt-0.5" :class="isUrgent(task) ? 'text-amber-500/80' : 'text-zinc-400'">
                    {{ formatRelativeDate(task.deadline!) }}
                  </p>
                </div>
                <!-- Priority dot -->
                <span
                  class="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-red-400': task.priority === 'high',
                    'bg-amber-400': task.priority === 'medium',
                    'bg-green-400': task.priority === 'low',
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Mini Calendar -->
          <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                {{ miniCalMonthLabel }}
              </h3>
              <div class="flex items-center gap-1">
                <button @click="miniCalOffset--" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button @click="miniCalOffset = 0" class="text-[10px] font-medium text-indigo-500 hover:text-indigo-600 px-1.5 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition">
                  Today
                </button>
                <button @click="miniCalOffset++" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <!-- DOW headers -->
            <div class="grid grid-cols-7 mb-1">
              <span v-for="d in ['M','T','W','T','F','S','S']" :key="d + Math.random()"
                class="text-center text-[9px] font-semibold text-zinc-400 dark:text-zinc-600 py-0.5"
              >{{ d }}</span>
            </div>

            <!-- Day cells -->
            <div class="grid grid-cols-7 gap-0.5">
              <div
                v-for="cell in miniCalCells"
                :key="cell.date.toISOString()"
                class="relative flex items-center justify-center h-7 w-full rounded-full text-[11px] select-none transition-colors"
                :class="[
                  !cell.isCurrentMonth ? 'text-zinc-300 dark:text-zinc-700' : '',
                  cell.isToday ? 'bg-indigo-500 text-white font-bold' : '',
                  !cell.isToday && cell.isCurrentMonth ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer' : '',
                  cell.hasTasks && !cell.isToday ? 'font-semibold' : '',
                ]"
              >
                {{ cell.date.getDate() }}
                <!-- task dot -->
                <span
                  v-if="cell.hasTasks && !cell.isToday"
                  class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"
                />
              </div>
            </div>
          </div>

          <!-- ─── Lịch âm ────────────────────────────────────────── -->
          <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">

            <!-- Today's lunar date — highlighted header -->
            <div class="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div class="flex items-center gap-2 mb-2.5">
                <span class="w-1.5 h-4 rounded-full bg-red-400" />
                <h3 class="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">Lịch Âm</h3>
              </div>

              <!-- Big lunar date display -->
              <div class="flex items-end justify-between gap-2">
                <div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-4xl font-bold tracking-tight text-red-500 leading-none">
                      {{ todayLunar.date }}
                    </span>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide leading-tight">Tháng</span>
                      <span class="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-tight">
                        {{ lunarMonthName(todayLunar.month, todayLunar.isLeap) }}
                      </span>
                    </div>
                  </div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    Năm <span class="text-zinc-700 dark:text-zinc-300">{{ todayLunar.lunarYear }}</span>
                  </p>
                </div>

                <!-- Can Chi badges -->
                <div class="flex flex-col items-end gap-1">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    {{ todayLunar.lunarDate }}
                  </span>
                  <span v-if="todayLunar.isVegetarianDay" class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                    🌿 Ngày chay
                  </span>
                  <span v-if="todayLunar.solarTerm" class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
                    {{ todayLunar.solarTerm }}
                  </span>
                </div>
              </div>

              <!-- Holiday from lunar calendar -->
              <div v-if="todayLunar.holiday" class="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-red-600 dark:text-red-400">
                <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                {{ todayLunar.holiday }}
              </div>

              <!-- Lucky hours -->
              <div v-if="todayLunar.luckyHours" class="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                🕐 Giờ tốt: <span class="text-zinc-600 dark:text-zinc-400 font-medium">{{ todayLunar.luckyHours }}</span>
              </div>
            </div>

            <!-- Monthly lunar grid -->
            <div class="p-3">
              <!-- Nav header -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                  {{ lunarCalHeaderLabel }}
                </span>
                <div class="flex items-center gap-0.5 shrink-0">
                  <button @click="lunarCalOffset--" class="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <button @click="lunarCalOffset = 0" class="text-[9px] font-medium text-indigo-500 hover:text-indigo-600 px-1 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition">
                    nay
                  </button>
                  <button @click="lunarCalOffset++" class="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>

              <!-- DOW headers -->
              <div class="grid grid-cols-7 mb-1">
                <span
                  v-for="(d, i) in ['T2','T3','T4','T5','T6','T7','CN']"
                  :key="d"
                  class="text-center text-[9px] font-semibold py-0.5"
                  :class="i >= 5 ? 'text-red-400' : 'text-zinc-400 dark:text-zinc-600'"
                >{{ d }}</span>
              </div>

              <!-- Day grid -->
              <div class="grid grid-cols-7 gap-y-0.5">
                <div
                  v-for="(day, idx) in lunarCalendar.weeks.flat()"
                  :key="idx"
                  class="flex flex-col items-center justify-center h-8 rounded-lg text-[10px] select-none transition-colors cursor-default"
                  :class="[
                    day.isDisabled ? 'opacity-30' : '',
                    day.isToday
                      ? 'bg-red-500 text-white font-bold rounded-lg'
                      : '',
                    !day.isToday && !day.isDisabled
                      ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
                      : '',
                    // Weekend highlight
                    !day.isToday && !day.isDisabled && (idx % 7 === 6)
                      ? 'text-red-500 dark:text-red-400'
                      : '',
                    !day.isToday && !day.isDisabled && !(idx % 7 === 6)
                      ? 'text-zinc-700 dark:text-zinc-300'
                      : '',
                  ]"
                  :title="day.lunar.holiday ?? day.lunar.solarTerm ?? ''"
                >
                  <!-- Solar date -->
                  <span class="font-semibold leading-none">{{ day.solar.date }}</span>
                  <!-- Lunar date -->
                  <span
                    class="leading-none mt-0.5 font-normal"
                    :class="[
                      day.isToday ? 'text-red-100' : 'text-zinc-400 dark:text-zinc-600',
                      // Highlight ngày 1 và 15 âm lịch
                      (day.lunar.date === 1 || day.lunar.date === 15) && !day.isToday
                        ? '!text-red-400 dark:!text-red-400 font-semibold'
                        : '',
                    ]"
                  >{{ day.lunar.date }}</span>
                  <!-- Holiday/solarTerm dot -->
                  <span
                    v-if="(day.lunar.holiday || day.lunar.solarTerm) && !day.isToday"
                    class="w-1 h-1 rounded-full bg-amber-400 mt-0.5"
                  />
                </div>
              </div>

              <!-- Legend -->
              <div class="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span class="flex items-center gap-1 text-[9px] text-zinc-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  Mùng 1/Rằm
                </span>
                <span class="flex items-center gap-1 text-[9px] text-zinc-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Lễ/Tiết
                </span>
              </div>
            </div>
          </div>

          <!-- Overdue alert -->          <div
            v-if="overdueCount > 0"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
          >
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <div class="flex-1">
              <p class="text-xs font-semibold text-red-700 dark:text-red-400">{{ overdueCount }} task quá hạn</p>
              <NuxtLink to="/tasks" class="text-[10px] text-red-500 hover:underline">Xem ngay →</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Detail Modal ─────────────────────────────────────────── -->
    <TasksDetailModal v-model="detailOpen" :task="selectedTask" />
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'
import { useHolidays, toDateStr } from '~/composables/useHolidays'
import { useLunarCalendar, formatLunarFull, type CalendarDay } from '~/composables/useLunarCalendar'

useHead({ title: 'Today — Focus' })

const todoStore = useTodoStore()
const authStore = useAuthStore()
const { ensureYears, getForDay } = useHolidays()

onMounted(async () => {
  await todoStore.fetchTodos()
  await ensureYears(new Date().getFullYear())
})

// ── Live clock ────────────────────────────────────────────────────────────────
const now = ref(new Date())
let clockInterval: ReturnType<typeof setInterval>
onMounted(() => { clockInterval = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(clockInterval))

const clockTime = computed(() => {
  const h = now.value.getHours() % 12 || 12
  const m = String(now.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})
const clockAmPm = computed(() => now.value.getHours() < 12 ? 'AM' : 'PM')

// ── Greeting ──────────────────────────────────────────────────────────────────
const greeting = computed(() => {
  const h = now.value.getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  if (h < 21) return 'Good evening,'
  return 'Good night,'
})
const greetingEmoji = computed(() => {
  const h = now.value.getHours()
  if (h < 6)  return '🌙'
  if (h < 12) return '☀️'
  if (h < 17) return '🌤️'
  if (h < 21) return '🌆'
  return '🌙'
})

const fullDate = computed(() =>
  now.value.toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }),
)

// ── Weather (mock) ────────────────────────────────────────────────────────────
const weather = { icon: '⛅', temp: '28°C', condition: 'Partly Cloudy' }

// ── Holidays ──────────────────────────────────────────────────────────────────
const todayHolidays = computed(() => getForDay(now.value))

// ── Task data ─────────────────────────────────────────────────────────────────
const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

const todayTasks = computed(() =>
  todoStore.todos.filter(t => t.deadline && isSameDay(new Date(t.deadline), now.value)),
)

const sortedTodayTasks = computed(() =>
  [...todayTasks.value].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
  }),
)

const todayDone = computed(() => todayTasks.value.filter(t => t.completed).length)
const todayProgressPct = computed(() =>
  todayTasks.value.length === 0 ? 0 : Math.round((todayDone.value / todayTasks.value.length) * 100),
)

// upcoming: next 3 days (excluding today)
const upcomingTasks = computed(() => {
  const start = new Date(now.value)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 3)
  return todoStore.todos
    .filter(t => {
      if (t.completed || !t.deadline) return false
      const d = new Date(t.deadline)
      return d >= start && d < end
    })
    .sort((a, b) => {
      const da = new Date(a.deadline!).getTime()
      const db = new Date(b.deadline!).getTime()
      if (da !== db) return da - db
      return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
    })
})

const overdueCount = computed(() => {
  const n = new Date()
  return todoStore.todos.filter(t => !t.completed && t.deadline && new Date(t.deadline) < n).length
})

function isUrgent(task: Todo) {
  if (!task.deadline) return false
  const diff = new Date(task.deadline).getTime() - Date.now()
  return diff < 86400_000 // less than 1 day
}

function formatRelativeDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 0) {
    if (Math.abs(diff) < 86400000) return `Quá hạn lúc ${timeStr}`
    return `${Math.ceil(Math.abs(diff) / 86400000)} ngày trước`
  }
  if (diff < 86400000) return `Hôm nay ${timeStr}`
  if (diff < 172800000) return `Ngày mai ${timeStr}`
  if (diff < 259200000) return `Ngày kia ${timeStr}`
  return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`
}

// ── Summary chips ─────────────────────────────────────────────────────────────
const summaryChips = computed(() => [
  {
    label: 'hôm nay',
    value: todayTasks.value.length,
    icon: `<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    class: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'hoàn thành',
    value: todayDone.value,
    icon: `<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    class: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400',
  },
  {
    label: 'sắp đến hạn',
    value: upcomingTasks.value.length,
    icon: `<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    class: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  ...(overdueCount.value > 0 ? [{
    label: 'quá hạn',
    value: overdueCount.value,
    icon: `<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
    class: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400',
  }] : []),
])

// ── Lịch âm ───────────────────────────────────────────────────────────────────
const { toLunar, toCalendar, lunarMonthName } = useLunarCalendar()

const todayLunar = computed(() => toLunar(now.value))

const lunarCalOffset = ref(0)

const lunarCalSolarDate = computed(() => {
  const d = new Date(now.value.getFullYear(), now.value.getMonth() + lunarCalOffset.value, 1)
  return d
})

const lunarCalendar = computed(() =>
  toCalendar(lunarCalSolarDate.value.getFullYear(), lunarCalSolarDate.value.getMonth() + 1),
)

// Header: "Tháng Giêng Giáp Thìn" — dùng lunar của ngày 15 tháng để tránh edge-case tháng nhuận
const lunarCalHeaderLabel = computed(() => {
  const mid = new Date(lunarCalSolarDate.value.getFullYear(), lunarCalSolarDate.value.getMonth(), 15)
  const l = toLunar(mid)
  return `Tháng ${lunarMonthName(l.month, l.isLeap)} ${l.lunarYear}`
})

// ── Mini calendar ─────────────────────────────────────────────────────────────
const miniCalOffset = ref(0)

const miniCalDate = computed(() => {
  const d = new Date(now.value.getFullYear(), now.value.getMonth() + miniCalOffset.value, 1)
  return d
})

const miniCalMonthLabel = computed(() =>
  miniCalDate.value.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
)

const todoDateSet = computed(() => {
  const s = new Set<string>()
  todoStore.todos.forEach(t => { if (t.deadline) s.add(toDateStr(new Date(t.deadline))) })
  return s
})

const miniCalCells = computed(() => {
  const y = miniCalDate.value.getFullYear()
  const m = miniCalDate.value.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)
  const leadDow = (firstDay.getDay() + 6) % 7
  const total = Math.ceil((leadDow + lastDay.getDate()) / 7) * 7
  const today = new Date()

  return Array.from({ length: total }, (_, i) => {
    const date = new Date(y, m, 1 - leadDow + i)
    return {
      date,
      isCurrentMonth: date.getMonth() === m,
      isToday: isSameDay(date, today),
      hasTasks: todoDateSet.value.has(toDateStr(date)),
    }
  })
})

// ── Detail modal ──────────────────────────────────────────────────────────────
const detailOpen = ref(false)
const selectedTask = ref<Todo | null>(null)

function openDetail(task: Todo) {
  selectedTask.value = task
  detailOpen.value = true
}
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to   { opacity: 0; transform: translateY(-4px); }

.task-fade-enter-active { transition: all 0.25s ease; }
.task-fade-leave-active { transition: all 0.2s ease; }
.task-fade-enter-from   { opacity: 0; transform: translateX(-8px); }
.task-fade-leave-to     { opacity: 0; transform: translateX(8px); }
.task-fade-move         { transition: transform 0.3s ease; }
</style>
