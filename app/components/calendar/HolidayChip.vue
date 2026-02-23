<template>
  <!-- Read-only holiday chip — red/gold flag style, cannot be clicked to edit -->
  <div
    class="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium truncate max-w-full w-full select-none"
    style="background: rgba(239,68,68,0.12); color: #dc2626;"
    :title="holiday.localName + (holiday.name !== holiday.localName ? ' · ' + holiday.name : '')"
  >
    <!-- Flag icon -->
    <span class="shrink-0 text-[10px]">🇻🇳</span>
    <span class="truncate">{{ holiday.localName }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Holiday } from '~/composables/useHolidays'

defineProps<{ holiday: Holiday }>()
</script>
