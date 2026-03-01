<template>
  <Transition name="backdrop">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

      <Transition name="modal">
        <div v-if="modelValue && task" class="relative z-10 w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">

          <!-- Header -->
          <div class="flex items-start gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <!-- Checkbox -->
            <button
              @click="todoStore.toggleTodo(task._id)"
              :class="['mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200', task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-400']"
            >
              <svg v-if="task.completed" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
            <div class="flex-1 min-w-0">
              <h2 :class="['text-base font-semibold leading-snug', task.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100']">{{ task.title }}</h2>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <!-- Category badge -->
                <span v-if="category" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" :style="{ backgroundColor: category.color + '22', color: category.color }">
                  <CategoryIcon :icon="category.icon" size="w-3 h-3" :color="category.color" />
                  {{ category.name }}
                </span>
                <!-- Priority -->
                <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', priorityClass[task.priority]]">
                  {{ task.priority }}
                </span>
                <!-- Deadline -->
                <span v-if="task.deadline" :class="['text-[11px]', isOverdue ? 'text-red-400' : 'text-zinc-400']">
                  📅 {{ formatDate(task.deadline) }}
                </span>
                <span v-else class="text-[11px] text-zinc-400">Chưa có deadline</span>
              </div>
            </div>
            <button @click="$emit('update:modelValue', false)" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">

            <!-- Description -->
            <div v-if="task.description">
              <p class="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Description</p>
              <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{{ task.description }}</p>
            </div>

            <!-- Subtasks -->
            <div v-if="task.subTasks && task.subTasks.length">
              <p class="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Subtasks ({{ task.subTasks.filter(s=>s.completed).length }}/{{ task.subTasks.length }})</p>
              <ul class="space-y-1.5">
                <li v-for="sub in task.subTasks" :key="sub.id" class="flex items-center gap-2 text-sm">
                  <span :class="['w-3.5 h-3.5 rounded border flex items-center justify-center', sub.completed ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 dark:border-zinc-600']">
                    <svg v-if="sub.completed" class="w-2 h-2 text-white" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  <span :class="sub.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'">{{ sub.title }}</span>
                </li>
              </ul>
            </div>

            <!-- Requirements -->
            <div v-if="task.requirements && task.requirements.length">
              <p class="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Requirements</p>
              <ul class="space-y-1">
                <li v-for="req in task.requirements" :key="req.id" class="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <svg class="w-3.5 h-3.5 mt-0.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  {{ req.content }}
                </li>
              </ul>
            </div>

            <!-- Deadline editor -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Deadline</p>
                <button
                  v-if="!editingDeadline"
                  @click="startEditDeadline"
                  class="text-[11px] font-medium text-indigo-500 hover:text-indigo-600 px-2 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                >
                  {{ task.deadline ? 'Sửa' : 'Thêm' }}
                </button>
              </div>

              <!-- Display mode -->
              <div v-if="!editingDeadline"
                class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
              >
                <svg class="w-3.5 h-3.5 shrink-0" :class="isOverdue ? 'text-red-400' : 'text-zinc-400'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span v-if="task.deadline" class="text-sm font-medium" :class="isOverdue ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'">
                  {{ formatFull(task.deadline) }}
                </span>
                <span v-else class="text-sm text-zinc-400 dark:text-zinc-500 italic">Chưa đặt deadline</span>
              </div>

              <!-- Edit mode -->
              <div v-else class="flex items-center gap-2">
                <input
                  v-model="deadlineInput"
                  type="datetime-local"
                  class="flex-1 px-3 py-2 text-sm rounded-xl border border-indigo-300 dark:border-indigo-500/50 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  @click="saveDeadline"
                  :disabled="savingDeadline"
                  class="px-3 py-2 text-sm font-medium rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 transition-all shadow-sm shrink-0"
                >
                  {{ savingDeadline ? '…' : 'Lưu' }}
                </button>
                <button
                  @click="cancelEditDeadline"
                  class="px-3 py-2 text-sm rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0"
                >
                  Huỷ
                </button>
                <button
                  v-if="task.deadline"
                  @click="clearDeadline"
                  :disabled="savingDeadline"
                  class="p-2 text-sm rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                  title="Xoá deadline"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <p class="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Created</p>
                <p class="text-xs text-zinc-700 dark:text-zinc-300">{{ formatFull(task.createdAt) }}</p>
              </div>
              <div class="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <p class="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Updated</p>
                <p class="text-xs text-zinc-700 dark:text-zinc-300">{{ formatFull(task.updatedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <button
              @click="deleteTask"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete
            </button>
            <span class="text-[11px] text-zinc-400">ID: {{ task._id.slice(-6) }}</span>
          </div>

        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'

const props = defineProps<{ modelValue: boolean; task: Todo | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const todoStore = useTodoStore()
const categoryStore = useCategoryStore()

// Always read from store so toggle/updates reflect immediately inside the modal
const task = computed(() =>
  props.task ? (todoStore.todos.find(t => t._id === props.task!._id) ?? props.task) : null,
)

const category = computed(() =>
  task.value ? categoryStore.getCategoryById(task.value.categoryId) : null,
)

const isOverdue = computed(() =>
  task.value ? (!task.value.completed && !!task.value.deadline && new Date(task.value.deadline) < new Date()) : false,
)

const priorityClass: Record<string, string> = {
  high:   'bg-red-50 dark:bg-red-500/10 text-red-500',
  medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500',
  low:    'bg-green-50 dark:bg-green-500/10 text-green-500',
}

function formatDate(d: string | null) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / 86400000)
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 0) {
    const absDiff = Math.abs(diff)
    if (absDiff < 86400000) return `Quá hạn lúc ${timeStr}`
    return `${Math.ceil(absDiff / 86400000)}d quá hạn`
  }
  if (diff < 86400000) return `Hôm nay ${timeStr}`
  if (days === 1) return `Ngày mai ${timeStr}`
  return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`
}

function formatFull(d: string) {
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Edit deadline ──────────────────────────────────────────────────────────────
const editingDeadline = ref(false)
const deadlineInput = ref('')
const savingDeadline = ref(false)

function toDatetimeLocalStr(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function startEditDeadline() {
  deadlineInput.value = toDatetimeLocalStr(task.value?.deadline ?? null)
  editingDeadline.value = true
}

function cancelEditDeadline() {
  editingDeadline.value = false
  deadlineInput.value = ''
}

async function saveDeadline() {
  if (!task.value) return
  savingDeadline.value = true
  try {
    const deadline = deadlineInput.value ? new Date(deadlineInput.value).toISOString() : null
    await todoStore.updateTodo(task.value._id, { deadline } as any)
    editingDeadline.value = false
  } finally {
    savingDeadline.value = false
  }
}

async function clearDeadline() {
  if (!task.value) return
  savingDeadline.value = true
  try {
    await todoStore.updateTodo(task.value._id, { deadline: null } as any)
    editingDeadline.value = false
  } finally {
    savingDeadline.value = false
  }
}

async function deleteTask() {
  if (!task.value) return
  await todoStore.deleteTodo(task.value._id)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
.modal-enter-active { transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from { opacity: 0; transform: translateY(20px) scale(0.97); }
.modal-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>
