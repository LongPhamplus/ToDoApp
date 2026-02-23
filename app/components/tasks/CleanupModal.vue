<template>
  <Transition name="backdrop">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="open = false" />

      <Transition name="modal">
        <div v-if="open" class="relative z-10 w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-y-auto">
          <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </span>
            <div>
              <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Dọn dẹp Tasks</h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Xóa hàng loạt task theo điều kiện</p>
            </div>
          </div>
          <button @click="open = false" class="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Chọn điều kiện dọn dẹp</p>

          <!-- Completed All -->
          <label class="flex items-start gap-3 cursor-pointer group">
            <div class="mt-0.5">
              <input type="checkbox" v-model="opts.completedAll" @change="onCompletedAllChange"
                class="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer" />
            </div>
            <div class="flex-1">
              <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Xóa tất cả task đã hoàn thành</span>
              <p class="text-xs text-zinc-400 mt-0.5">Bất kể hoàn thành bao lâu</p>
            </div>
          </label>

          <!-- Completed older than N days -->
          <label class="flex items-start gap-3 cursor-pointer" :class="{ 'opacity-40 pointer-events-none': opts.completedAll }">
            <div class="mt-0.5">
              <input type="checkbox" v-model="opts.useCompletedDays"
                class="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer" />
            </div>
            <div class="flex-1 space-y-1.5">
              <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Xóa task đã hoàn thành sau</span>
              <div class="flex items-center gap-2">
                <input
                  type="number" v-model.number="opts.completedOlderThanDays"
                  min="1" max="365"
                  :disabled="!opts.useCompletedDays"
                  class="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40"
                />
                <span class="text-sm text-zinc-500">ngày</span>
              </div>
            </div>
          </label>

          <div class="border-t border-zinc-100 dark:border-zinc-800 my-1" />

          <!-- Overdue All -->
          <label class="flex items-start gap-3 cursor-pointer">
            <div class="mt-0.5">
              <input type="checkbox" v-model="opts.overdueAll" @change="onOverdueAllChange"
                class="h-4 w-4 rounded border-zinc-300 text-red-500 focus:ring-red-500 cursor-pointer" />
            </div>
            <div class="flex-1">
              <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Xóa tất cả task quá hạn</span>
              <p class="text-xs text-zinc-400 mt-0.5">Task chưa hoàn thành và đã qua deadline</p>
            </div>
          </label>

          <!-- Overdue older than N days -->
          <label class="flex items-start gap-3 cursor-pointer" :class="{ 'opacity-40 pointer-events-none': opts.overdueAll }">
            <div class="mt-0.5">
              <input type="checkbox" v-model="opts.useOverdueDays"
                class="h-4 w-4 rounded border-zinc-300 text-red-500 focus:ring-red-500 cursor-pointer" />
            </div>
            <div class="flex-1 space-y-1.5">
              <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Xóa task quá hạn hơn</span>
              <div class="flex items-center gap-2">
                <input
                  type="number" v-model.number="opts.overdueOlderThanDays"
                  min="1" max="365"
                  :disabled="!opts.useOverdueDays"
                  class="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-40"
                />
                <span class="text-sm text-zinc-500">ngày</span>
              </div>
            </div>
          </label>
        </div>

        <!-- Preview Section -->
        <div v-if="hasAnyOption" class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Xem trước</p>
            <button @click="runPreview"
              :disabled="previewLoading"
              class="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 disabled:opacity-50 transition">
              <svg v-if="previewLoading" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 15A8 8 0 1118.364 9"/>
              </svg>
              {{ previewLoading ? 'Đang tải...' : 'Làm mới' }}
            </button>
          </div>

          <!-- Loading skeleton -->
          <div v-if="previewLoading" class="space-y-2">
            <div v-for="i in 3" :key="i" class="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>

          <!-- Empty preview -->
          <div v-else-if="previewItems.length === 0 && previewFetched"
            class="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
            <svg class="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm text-zinc-500">Không có task nào phù hợp điều kiện</span>
          </div>

          <!-- Preview list -->
          <div v-else-if="previewItems.length > 0"
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <!-- Count banner -->
            <div class="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border-b border-red-100 dark:border-red-500/20">
              <svg class="h-3.5 w-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <span class="text-xs font-medium text-red-600 dark:text-red-400">
                {{ previewItems.length }} task sẽ bị xóa vĩnh viễn
              </span>
            </div>
            <!-- Scrollable list -->
            <div class="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              <div v-for="task in previewItems" :key="task._id"
                class="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                <!-- Status dot -->
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  :class="task.completed
                    ? 'bg-green-100 dark:bg-green-500/10'
                    : 'bg-red-100 dark:bg-red-500/10'">
                  <svg v-if="task.completed" class="h-3 w-3 text-green-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg v-else class="h-3 w-3 text-red-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{{ task.title }}</p>
                  <p class="text-[10px] text-zinc-400">
                    <span v-if="task.category">{{ task.category.name }} · </span>
                    <span v-if="task.deadline">Deadline: {{ formatDate(task.deadline) }}</span>
                    <span v-else>Không có deadline</span>
                  </p>
                </div>
                <!-- Priority badge -->
                <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                  :class="{
                    'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400': task.priority === 'high',
                    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400': task.priority === 'medium',
                    'bg-zinc-100 dark:bg-zinc-700 text-zinc-500': task.priority === 'low',
                  }">
                  {{ task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
          <svg class="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p class="text-xs text-amber-700 dark:text-amber-400">
            Hành động này <strong>không thể hoàn tác</strong>. Tasks bị xóa sẽ mất vĩnh viễn.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-1">
          <button @click="open = false"
            class="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
            Hủy
          </button>
          <button @click="runPreview" v-if="hasAnyOption && !previewFetched"
            :disabled="previewLoading"
            class="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-300 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition">
            Xem trước
          </button>
          <button @click="confirmCleanup"
            :disabled="!hasAnyOption || deleteLoading || previewItems.length === 0"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition">
            <svg v-if="deleteLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {{ deleteLoading ? 'Đang xóa...' : `Xóa ${previewItems.length > 0 ? previewItems.length + ' tasks' : ''}` }}
          </button>
        </div>

          </div><!-- end p-6 -->
        </div><!-- end inner card -->
      </Transition>
    </div><!-- end backdrop overlay -->
  </Transition>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ done: [deleted: number] }>()

const todoStore = useTodoStore()

// ── Options ──────────────────────────────────────────────────────────────────
const opts = reactive({
  completedAll: false,
  useCompletedDays: false,
  completedOlderThanDays: 30,
  overdueAll: false,
  useOverdueDays: false,
  overdueOlderThanDays: 7,
})

function onCompletedAllChange() {
  if (opts.completedAll) opts.useCompletedDays = false
  invalidatePreview()
}

function onOverdueAllChange() {
  if (opts.overdueAll) opts.useOverdueDays = false
  invalidatePreview()
}

const hasAnyOption = computed(() =>
  opts.completedAll ||
  (opts.useCompletedDays && opts.completedOlderThanDays > 0) ||
  opts.overdueAll ||
  (opts.useOverdueDays && opts.overdueOlderThanDays > 0),
)

// ── Preview ──────────────────────────────────────────────────────────────────
const previewItems = ref<any[]>([])
const previewLoading = ref(false)
const previewFetched = ref(false)
const deleteLoading = ref(false)

function invalidatePreview() {
  previewItems.value = []
  previewFetched.value = false
}

// Debounced auto-preview khi thay đổi options
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => [opts.completedAll, opts.useCompletedDays, opts.completedOlderThanDays, opts.overdueAll, opts.useOverdueDays, opts.overdueOlderThanDays],
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (hasAnyOption.value) {
      debounceTimer = setTimeout(() => runPreview(), 600)
    }
  },
)

async function runPreview() {
  if (!hasAnyOption.value) return
  previewLoading.value = true
  previewFetched.value = false
  try {
    const payload = buildPayload(true)
    const res = await todoStore.cleanupTodos(payload)
    previewItems.value = res.data?.preview ?? []
    previewFetched.value = true
  } finally {
    previewLoading.value = false
  }
}

async function confirmCleanup() {
  if (!hasAnyOption.value || previewItems.value.length === 0) return
  deleteLoading.value = true
  try {
    const payload = buildPayload(false)
    const res = await todoStore.cleanupTodos(payload)
    emit('done', res.data?.deleted ?? 0)
    open.value = false
    resetForm()
  } finally {
    deleteLoading.value = false
  }
}

function buildPayload(dryRun: boolean) {
  const p: any = { dryRun }
  if (opts.completedAll) {
    p.completedAll = true
  } else if (opts.useCompletedDays) {
    p.completedOlderThanDays = opts.completedOlderThanDays
  }
  if (opts.overdueAll) {
    p.overdueAll = true
  } else if (opts.useOverdueDays) {
    p.overdueOlderThanDays = opts.overdueOlderThanDays
  }
  return p
}

function resetForm() {
  Object.assign(opts, {
    completedAll: false, useCompletedDays: false, completedOlderThanDays: 30,
    overdueAll: false, useOverdueDays: false, overdueOlderThanDays: 7,
  })
  previewItems.value = []
  previewFetched.value = false
}

// Reset khi đóng modal
watch(open, (v) => { if (!v) resetForm() })

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.modal-enter-active { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease; }
.modal-leave-active { transition: transform 0.18s ease, opacity 0.18s ease; }
.modal-enter-from { transform: translateY(20px) scale(0.97); opacity: 0; }
.modal-leave-to  { transform: translateY(10px) scale(0.97); opacity: 0; }
</style>
