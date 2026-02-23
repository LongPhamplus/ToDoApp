<template>
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <!-- View switcher -->
    <div class="relative flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <span
        class="absolute top-0.5 bottom-0.5 rounded-[10px] bg-white dark:bg-zinc-700 shadow-sm transition-all duration-200"
        :style="pillStyle"
        aria-hidden="true"
      />
      <button
        v-for="v in views"
        :key="v.value"
        :ref="el => { if (el) viewRefs[v.value] = el as HTMLElement }"
        @click="emit('update:model-value', v.value)"
        :class="['relative z-10 px-4 py-1.5 text-sm font-medium rounded-[10px] transition-colors duration-200 whitespace-nowrap', modelValue === v.value ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200']"
      >{{ v.label }}</button>
    </div>

    <!-- Date nav -->
    <div class="flex items-center gap-2">
      <button @click="$emit('prev')" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <button @click="$emit('today')" class="px-3 py-1.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all">
        Today
      </button>

      <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 min-w-[140px] text-center">{{ title }}</span>

      <button @click="$emit('next')" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type CalView = 'week' | 'month' | 'year'

const props = defineProps<{ modelValue: CalView; title: string }>()
const emit = defineEmits<{
  (e: 'update:model-value', v: CalView): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'today'): void
}>()

const views: { value: CalView; label: string }[] = [
  { value: 'week',  label: 'Week'  },
  { value: 'month', label: 'Month' },
  { value: 'year',  label: 'Year'  },
]

const viewRefs = reactive<Record<string, HTMLElement>>({})

const pillStyle = ref<{ left: string; width: string }>({ left: '0px', width: '0px' })

function updatePill() {
  const el = viewRefs[props.modelValue]
  if (!el) return
  pillStyle.value = { left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` }
}

onMounted(() => nextTick(updatePill))
watch(() => props.modelValue, () => nextTick(updatePill))
</script>
