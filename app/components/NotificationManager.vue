<template>
  <div>

    <!-- ─── Permission Banner ─────────────────────────────────────────────── -->
    <Transition name="banner">
      <div
        v-if="showBanner"
        class="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10"
      >
        <!-- Bell icon -->
        <div class="shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mt-0.5">
          <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-amber-800 dark:text-amber-300">Enable notifications</p>
          <p class="text-xs text-amber-600 dark:text-amber-400/80 mt-0.5">
            Get deadline reminders so you never miss a task.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="handleRequestPermission"
            :disabled="requesting"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60 transition-all duration-200 shadow-sm"
          >
            <svg v-if="requesting" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ requesting ? 'Requesting…' : 'Enable' }}
          </button>
          <button
            @click="dismissBanner"
            class="p-1.5 rounded-md text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all duration-200"
            title="Dismiss"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ─── Denied Banner ─────────────────────────────────────────────────── -->
    <Transition name="banner">
      <div
        v-if="showDenied"
        class="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
      >
        <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>
        <p class="text-xs text-red-600 dark:text-red-400 flex-1">
          Notifications blocked. Please enable them in your browser settings.
        </p>
        <button @click="showDenied = false" class="p-1 text-red-400 hover:text-red-600 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- ─── Settings panel (when granted) ────────────────────────────────── -->
    <div v-if="notifications.permission.value === 'granted'" class="group">

      <!-- Toggle header -->
      <button
        @click="settingsOpen = !settingsOpen"
        class="flex items-center gap-2 w-full text-left px-1 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200"
      >
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="settingsOpen ? 'rotate-90' : ''"
          fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        Notification settings
        <span class="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </button>

      <Transition name="settings-panel">
        <div
          v-if="settingsOpen"
          class="mt-2 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3"
        >
          <!-- Master toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Enable reminders</p>
              <p class="text-xs text-zinc-400">Master switch for all notifications</p>
            </div>
            <button
              @click="notifications.settings.value.enabled = !notifications.settings.value.enabled"
              :class="[
                'relative inline-flex w-9 h-5 rounded-full p-0.5 transition-colors duration-300',
                notifications.settings.value.enabled ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700',
              ]"
            >
              <span :class="['w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300', notifications.settings.value.enabled ? 'translate-x-4' : 'translate-x-0']" />
            </button>
          </div>

          <div
            :class="['space-y-2.5 transition-opacity duration-200', notifications.settings.value.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none']"
          >
            <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Deadline warnings</p>

            <ToggleRow
              v-model="notifications.settings.value.deadlineWarnings.oneDayBefore"
              label="1 day before"
              description="Reminder the day before deadline"
            />
            <ToggleRow
              v-model="notifications.settings.value.deadlineWarnings.threeHoursBefore"
              label="3 hours before"
              description="Alert 3 hours ahead"
            />
            <ToggleRow
              v-model="notifications.settings.value.deadlineWarnings.oneHourBefore"
              label="1 hour before"
              description="Final warning 1 hour before"
            />

            <div class="border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
              <ToggleRow
                v-model="notifications.settings.value.overdueReminders"
                label="Overdue reminders"
                description="Notify when tasks become overdue"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const notifications = useNotifications()

// ── Banner state ─────────────────────────────────────────────────────────────
const dismissed = ref(false)
const requesting = ref(false)
const showDenied = ref(false)
const settingsOpen = ref(false)

const showBanner = computed(() =>
  !dismissed.value &&
  notifications.isSupported &&
  notifications.permission.value === 'default',
)

function dismissBanner() {
  dismissed.value = true
}

async function handleRequestPermission() {
  requesting.value = true
  try {
    await notifications.requestPermission()
    if (notifications.permission.value === 'denied') showDenied.value = true
    else if (notifications.permission.value === 'granted') {
      dismissed.value = false
      notifications.startMonitoring()
    }
  } finally {
    requesting.value = false
  }
}

onMounted(() => {
  if (notifications.permission.value === 'granted') {
    notifications.startMonitoring()
  }
})

onUnmounted(() => {
  notifications.stopMonitoring()
})
</script>

<!-- ─── Inline ToggleRow sub-component ────────────────────────────────────── -->
<script lang="ts">
import { defineComponent, h } from 'vue'

const ToggleRow = defineComponent({
  name: 'ToggleRow',
  props: {
    modelValue: Boolean,
    label: String,
    description: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'flex items-center justify-between gap-3' }, [
        h('div', {}, [
          h('p', { class: 'text-xs font-medium text-zinc-700 dark:text-zinc-300' }, props.label),
          props.description && h('p', { class: 'text-[11px] text-zinc-400' }, props.description),
        ]),
        h(
          'button',
          {
            onClick: () => emit('update:modelValue', !props.modelValue),
            class: [
              'relative inline-flex w-8 h-4 rounded-full p-0.5 transition-colors duration-300 shrink-0',
              props.modelValue ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700',
            ].join(' '),
          },
          [
            h('span', {
              class: [
                'w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300',
                props.modelValue ? 'translate-x-4' : 'translate-x-0',
              ].join(' '),
            }),
          ],
        ),
      ])
  },
})

export default { name: 'NotificationManager', components: { ToggleRow } }
</script>

<style scoped>
.banner-enter-active { transition: opacity 0.25s ease, max-height 0.3s ease, transform 0.25s ease; max-height: 200px; }
.banner-leave-active { transition: opacity 0.2s ease, max-height 0.25s ease; max-height: 200px; }
.banner-enter-from { opacity: 0; max-height: 0; transform: translateY(-8px); }
.banner-leave-to { opacity: 0; max-height: 0; }

.settings-panel-enter-active { transition: opacity 0.2s ease, max-height 0.3s ease; max-height: 400px; }
.settings-panel-leave-active { transition: opacity 0.15s ease, max-height 0.2s ease; max-height: 400px; }
.settings-panel-enter-from { opacity: 0; max-height: 0; }
.settings-panel-leave-to { opacity: 0; max-height: 0; }
</style>
