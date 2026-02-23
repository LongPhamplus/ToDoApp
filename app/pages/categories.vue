<template>
  <div class="min-h-full py-8 px-4 sm:px-6">
    <div class="max-w-5xl mx-auto space-y-6">

      <!-- ─── Page Header ──────────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Categories</h1>
          <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {{ categoryStore.categories.length }} categories · {{ todoStore.stats.total }} total tasks
          </p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium shadow-sm transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Category
        </button>
      </div>

      <!-- ─── Loading ──────────────────────────────────────────────────── -->
      <div v-if="categoryStore.loading && !categoryStore.categories.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>

      <!-- ─── Card Grid ─────────────────────────────────────────────────── -->
      <CategoriesCardGrid
        v-else
        @create="openCreate"
        @edit="openEdit"
        @delete="confirmDelete"
      />

      <!-- ─── Create / Edit Slide Panel ────────────────────────────────── -->
      <Transition name="side-panel">
        <div
          v-if="formOpen"
          class="fixed inset-0 z-50 flex"
        >
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="formOpen = false" />
          <div class="relative z-10 ml-auto w-full max-w-sm bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {{ editId ? 'Edit Category' : 'New Category' }}
              </h2>
              <button @click="formOpen = false" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-5">
              <CategoriesForm :editId="editId" @done="formOpen = false" @cancel="formOpen = false" />
            </div>
          </div>
        </div>
      </Transition>

      <!-- ─── Delete Dialog ────────────────────────────────────────────── -->
      <Transition name="fade">
        <div v-if="deleteTarget" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteTarget = null" />
          <div class="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Delete "{{ deleteTarget.name }}"?</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              This action cannot be undone.
            </p>
            <p v-if="deleteTarget.taskCount > 0" class="text-xs font-medium text-red-500 dark:text-red-400 mb-5">
              ⚠️ {{ deleteTarget.taskCount }} task{{ deleteTarget.taskCount > 1 ? 's' : '' }} in this category will also be permanently deleted.
            </p>
            <p v-else class="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
              This category has no tasks.
            </p>
            <div class="flex items-center justify-end gap-2">
              <button @click="deleteTarget = null" class="px-4 py-2 text-sm rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Cancel</button>
              <button @click="executeDelete" :disabled="deleting" class="px-4 py-2 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-all shadow-sm">
                {{ deleting ? 'Deleting…' : deleteTarget.taskCount > 0 ? `Delete category + ${deleteTarget.taskCount} task${deleteTarget.taskCount > 1 ? 's' : ''}` : 'Delete category' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Categories — Focus' })

const categoryStore = useCategoryStore()
const todoStore = useTodoStore()

onMounted(async () => {
  await Promise.all([categoryStore.fetchCategories(), todoStore.fetchTodos()])
})

// ── Form panel ───────────────────────────────────────────────────────────────
const formOpen = ref(false)
const editId = ref<string | null>(null)

function openCreate() { editId.value = null; formOpen.value = true }
function openEdit(id: string) { editId.value = id; formOpen.value = true }

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget = ref<{ id: string; name: string; taskCount: number } | null>(null)
const deleting = ref(false)

function confirmDelete(id: string, name: string) {
  const taskCount = todoStore.todos.filter(t => t.categoryId === id).length
  deleteTarget.value = { id, name, taskCount }
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
</script>

<style scoped>
.side-panel-enter-active { transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.side-panel-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.side-panel-enter-from { opacity: 0; transform: translateX(100%); }
.side-panel-leave-to { opacity: 0; transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
