<template>
  <!-- Iconify string (i-mdi-*, i-heroicons-*, etc.) → UIcon -->
  <UIcon
    v-if="isIconify"
    :name="icon"
    :class="iconClass"
    :style="iconStyle"
  />
  <!-- Fallback: plain text / emoji -->
  <span v-else :class="iconClass" :style="iconStyle">{{ icon || '📁' }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  class?: string
  color?: string
  size?: string   // tailwind size class e.g. 'w-4 h-4'
}>()

const isIconify = computed(() =>
  !!props.icon && (props.icon.startsWith('i-') || props.icon.includes('-') && !props.icon.includes(' ') && props.icon.length > 4)
)

const iconClass = computed(() => props.size ?? 'w-5 h-5')
const iconStyle = computed(() => props.color ? { color: props.color } : undefined)
</script>
