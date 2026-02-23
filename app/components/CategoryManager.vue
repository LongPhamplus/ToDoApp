<template>
  <!-- Trigger button -->
  <div>
    <slot name="trigger" :open="openModal">
      <button
        @click="openModal()"
        class="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Manage categories
      </button>
    </slot>
  </div>

  <!-- ─── Modal Backdrop ───────────────────────────────────────────────── -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      @keydown.escape="close"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

      <!-- ─── Modal Panel ──────────────────────────────────────────────── -->
      <Transition name="modal">
        <div
          v-if="isOpen"
          class="relative z-10 w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {{ editingId ? 'Edit Category' : 'Categories' }}
            </h2>
            <div class="flex items-center gap-2">
              <button
                v-if="!editingId && !showForm"
                @click="openCreateForm"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-200 shadow-sm"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                New
              </button>
              <button
                @click="close"
                class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- ─── Form (create / edit) ───────────────────────────────── -->
          <Transition name="slide-down">
            <div v-if="showForm" class="px-6 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 space-y-4">

              <!-- Name -->
              <div>
                <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Work, Health, Study…"
                  maxlength="32"
                  class="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                />
              </div>

              <!-- Icon (emoji) -->
              <div>
                <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Icon (emoji)</label>
                <div class="flex items-center gap-3">
                  <input
                    v-model="form.icon"
                    type="text"
                    placeholder="📁"
                    maxlength="4"
                    class="w-16 text-center px-3 py-2 text-lg rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                  />
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="emoji in quickEmojis"
                      :key="emoji"
                      @click="form.icon = emoji"
                      :class="[
                        'w-8 h-8 text-base rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-110',
                        form.icon === emoji
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-1 ring-indigo-400'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      ]"
                    >{{ emoji }}</button>
                  </div>
                </div>
              </div>

              <!-- Color -->
              <div>
                <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Color</label>
                <div class="flex items-center gap-3 flex-wrap">
                  <button
                    v-for="swatch in colorSwatches"
                    :key="swatch"
                    @click="form.color = swatch"
                    :title="swatch"
                    class="w-7 h-7 rounded-full transition-all duration-150 hover:scale-110 ring-offset-2 dark:ring-offset-zinc-900 ring-offset-white"
                    :class="form.color === swatch ? 'ring-2 ring-zinc-500' : ''"
                    :style="{ backgroundColor: swatch }"
                  />
                  <div class="flex items-center gap-2 ml-1">
                    <div class="w-7 h-7 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 overflow-hidden">
                      <input
                        v-model="form.color"
                        type="color"
                        class="w-10 h-10 -ml-1 -mt-1 cursor-pointer opacity-0 absolute"
                      />
                      <div class="w-full h-full" :style="{ backgroundColor: form.color }" />
                    </div>
                    <input
                      v-model="form.color"
                      type="text"
                      placeholder="#6366f1"
                      maxlength="7"
                      class="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <!-- Preview -->
              <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <span class="text-xl">{{ form.icon || '📁' }}</span>
                <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-1">{{ form.name || 'Category name' }}</span>
                <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: form.color || '#94a3b8' }" />
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-2 pt-1">
                <button
                  @click="cancelForm"
                  class="px-3.5 py-2 text-sm rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  @click="submitForm"
                  :disabled="!form.name.trim() || saving"
                  class="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-sm"
                >
                  <span v-if="saving" class="inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Saving…
                  </span>
                  <span v-else>{{ editingId ? 'Update' : 'Create' }}</span>
                </button>
              </div>
            </div>
          </Transition>

          <!-- ─── Category list ─────────────────────────────────────── -->
          <div class="flex-1 overflow-y-auto px-2 py-2">
            <!-- Loading -->
            <div v-if="categoryStore.loading" class="px-4 py-8 flex items-center justify-center">
              <svg class="w-5 h-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>

            <!-- Empty -->
            <div v-else-if="!categoryStore.categories.length" class="px-4 py-8 text-center">
              <p class="text-sm text-zinc-400">No categories yet.</p>
              <button @click="openCreateForm" class="mt-2 text-sm text-indigo-500 hover:text-indigo-600 font-medium">Create your first one →</button>
            </div>

            <!-- Items -->
            <TransitionGroup name="list" tag="ul" class="space-y-0.5">
              <li
                v-for="cat in categoryStore.categories"
                :key="cat._id"
                class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-150"
              >
                <!-- Color dot + icon -->
                <span
                  class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-sm"
                  :style="{ backgroundColor: cat.color + '22', border: `1px solid ${cat.color}44` }"
                >
                  {{ cat.icon }}
                </span>

                <!-- Name -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ cat.name }}</p>
                  <p class="text-[11px] text-zinc-400 font-mono">{{ cat.color }}</p>
                </div>

                <!-- Task count badge -->
                <span class="text-xs tabular-nums text-zinc-400 dark:text-zinc-500 shrink-0">
                  {{ todoCountByCategory[cat._id] ?? 0 }} tasks
                </span>

                <!-- Actions -->
                <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                  <button
                    @click="startEdit(cat._id)"
                    class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-150"
                    title="Edit"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    v-if="!cat.isDefault"
                    @click="confirmDelete(cat._id, cat.name)"
                    class="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
                    title="Delete"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </li>
            </TransitionGroup>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- ─── Delete confirmation dialog ──────────────────────────────────── -->
  <Transition name="backdrop">
    <div
      v-if="deleteTarget"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="deleteTarget = null" />
      <div class="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full">
        <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Delete "{{ deleteTarget.name }}"?</h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-5">This will remove the category. Tasks in it will become uncategorized.</p>
        <div class="flex items-center justify-end gap-2">
          <button @click="deleteTarget = null" class="px-4 py-2 text-sm rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200">Cancel</button>
          <button
            @click="executeDelete"
            :disabled="deleting"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Category } from '~/types/todo'

const categoryStore = useCategoryStore()
const todoStore = useTodoStore()

// ── Modal state ─────────────────────────────────────────────────────────────
const isOpen = ref(false)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

function openModal() {
  isOpen.value = true
  showForm.value = false
  editingId.value = null
}
function close() {
  isOpen.value = false
  cancelForm()
}

// ── Form ─────────────────────────────────────────────────────────────────────
const defaultForm = () => ({ name: '', icon: '📁', color: '#6366f1' })
const form = reactive(defaultForm())

const quickEmojis = ['📁', '💼', '🏠', '❤️', '📚', '🎯', '🏃', '🛒', '🎮', '✈️', '💡', '🔧']
const colorSwatches = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#94a3b8', '#1e293b',
]

function openCreateForm() {
  Object.assign(form, defaultForm())
  editingId.value = null
  showForm.value = true
}

function startEdit(id: string) {
  const cat = categoryStore.getCategoryById(id)
  if (!cat) return
  form.name = cat.name
  form.icon = cat.icon
  form.color = cat.color
  editingId.value = id
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
  Object.assign(form, defaultForm())
}

async function submitForm() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    if (editingId.value) {
      await categoryStore.updateCategory(editingId.value, {
        name: form.name.trim(),
        icon: form.icon || '📁',
        color: form.color,
      })
    } else {
      await categoryStore.createCategory({
        name: form.name.trim(),
        icon: form.icon || '📁',
        color: form.color,
        order: categoryStore.categories.length,
        isDefault: false,
      })
    }
    cancelForm()
  } finally {
    saving.value = false
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────
const deleteTarget = ref<{ id: string; name: string } | null>(null)
const deleting = ref(false)

function confirmDelete(id: string, name: string) {
  deleteTarget.value = { id, name }
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await categoryStore.deleteCategory(deleteTarget.value.id)
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

// ── Task counts per category ─────────────────────────────────────────────────
const todoCountByCategory = computed(() => {
  const map: Record<string, number> = {}
  todoStore.todos.forEach(t => {
    if (t.categoryId) map[t.categoryId] = (map[t.categoryId] ?? 0) + 1
  })
  return map
})
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.modal-enter-active { transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from { opacity: 0; transform: translateY(20px) scale(0.97); }
.modal-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }

.slide-down-enter-active { transition: opacity 0.2s ease, max-height 0.25s ease, transform 0.2s ease; max-height: 500px; }
.slide-down-leave-active { transition: opacity 0.15s ease, max-height 0.2s ease; max-height: 500px; }
.slide-down-enter-from { opacity: 0; max-height: 0; transform: translateY(-8px); }
.slide-down-leave-to { opacity: 0; max-height: 0; }

.list-enter-active, .list-leave-active { transition: all 0.2s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-10px); }
.list-move { transition: transform 0.2s ease; }
</style>
