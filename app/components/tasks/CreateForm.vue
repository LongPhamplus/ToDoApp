<template>
  <!-- Floating action trigger -->
  <div>
    <button
      @click="open = true"
      class="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      <span class="text-sm font-medium">New Task</span>
    </button>

    <!-- ─── Modal ──────────────────────────────────────────────────────── -->
    <Transition name="backdrop">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <Transition name="modal">
          <div v-if="open" class="relative z-10 w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[92vh]">

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Create Task</h2>
              <button @click="close" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              <!-- Title -->
              <div>
                <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Task title <span class="text-red-400">*</span></label>
                <input
                  v-model="form.title"
                  ref="titleInput"
                  type="text"
                  placeholder="What needs to be done?"
                  class="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Description</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  placeholder="Add details…"
                  class="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Category <span class="text-red-400">*</span></label>
                <div class="flex gap-2">
                  <div class="flex-1 relative">
                    <!-- Custom category dropdown -->
                    <div class="relative" v-click-outside="() => catOpen = false">
                      <button
                        type="button"
                        @click="catOpen = !catOpen"
                        class="w-full flex items-center gap-2 pl-3 pr-8 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-400 transition-all text-left"
                        :class="!form.categoryId ? 'text-zinc-400' : ''"
                      >
                        <template v-if="selectedCat">
                          <CategoryIcon :icon="selectedCat.icon" size="w-4 h-4" :color="selectedCat.color" />
                          <span>{{ selectedCat.name }}</span>
                        </template>
                        <span v-else>Select category…</span>
                        <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                      <!-- Dropdown list -->
                      <Transition name="slide-down">
                        <div v-if="catOpen" class="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
                          <button
                            v-for="cat in categoryStore.categories"
                            :key="cat._id"
                            type="button"
                            @click="form.categoryId = cat._id; catOpen = false"
                            class="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                            :class="form.categoryId === cat._id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'"
                          >
                            <CategoryIcon :icon="cat.icon" size="w-4 h-4" :color="cat.color" />
                            {{ cat.name }}
                          </button>
                        </div>
                      </Transition>
                    </div>
                  </div>
                  <!-- Quick add category -->
                  <button
                    @click="showQuickCat = !showQuickCat"
                    title="Add new category"
                    :class="['shrink-0 w-10 h-10 rounded-lg border transition-all flex items-center justify-center', showQuickCat ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-indigo-500 hover:border-indigo-300']"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>

                <!-- Quick Category Creator -->
                <Transition name="slide-down">
                  <div v-if="showQuickCat" class="mt-2 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 space-y-2">
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">New category</p>
                    <!-- Icon mini-picker -->
                    <div class="flex flex-wrap gap-1">
                      <button v-for="ic in quickIcons" :key="ic" type="button" @click="quickCat.icon = ic"
                        :class="['w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110', quickCat.icon === ic ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-1 ring-indigo-400' : 'bg-white dark:bg-zinc-800']"
                      ><CategoryIcon :icon="ic" size="w-4 h-4" :color="quickCat.icon === ic ? quickCat.color : undefined" /></button>
                    </div>
                    <div class="flex gap-2">
                      <input v-model="quickCat.name" type="text" placeholder="Category name…" maxlength="32"
                        class="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-indigo-400 transition-all" />
                      <input v-model="quickCat.color" type="color"
                        class="w-10 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer overflow-hidden bg-transparent p-0.5" />
                    </div>
                    <button
                      @click="createQuickCategory"
                      :disabled="!quickCat.name.trim() || creatingCat"
                      class="w-full py-1.5 text-xs font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 transition-all"
                    >{{ creatingCat ? 'Creating…' : 'Create & select' }}</button>
                  </div>
                </Transition>
              </div>

              <!-- Priority + Deadline row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Priority</label>
                  <div class="flex gap-1.5">
                    <button v-for="p in priorities" :key="p.value"
                      @click="form.priority = p.value"
                      :class="['flex-1 py-2 text-xs font-medium rounded-lg border transition-all', form.priority === p.value ? p.activeClass : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300']"
                    >{{ p.label }}</button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Deadline</label>
                  <input
                    v-model="form.deadline"
                    type="datetime-local"
                    class="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <button @click="close" class="px-4 py-2 text-sm rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Cancel</button>
              <button
                @click="submit"
                :disabled="!form.title.trim() || !form.categoryId || saving"
                class="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span v-if="saving" class="inline-flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>Saving…
                </span>
                <span v-else>Create Task</span>
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const categoryStore = useCategoryStore()
const todoStore = useTodoStore()

const open = ref(false)
const saving = ref(false)
const showQuickCat = ref(false)
const creatingCat = ref(false)
const catOpen = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

const defaultForm = () => ({
  title: '',
  description: '',
  categoryId: categoryStore.categories[0]?._id ?? '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  deadline: '',
})

const form = reactive(defaultForm())
const quickCat = reactive({ name: '', icon: 'i-mdi-folder', color: '#6366f1' })

const selectedCat = computed(() =>
  categoryStore.categories.find(c => c._id === form.categoryId) ?? null
)

const priorities = [
  { value: 'high'   as const, label: '🔴 High', activeClass: 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
  { value: 'medium' as const, label: '🟡 Med',  activeClass: 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'low'    as const, label: '🟢 Low',  activeClass: 'border-green-400 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' },
]

const quickIcons = [
  'i-mdi-briefcase', 'i-mdi-account', 'i-mdi-school', 'i-mdi-cart',
  'i-mdi-home', 'i-mdi-heart', 'i-mdi-star', 'i-mdi-book-open',
  'i-mdi-lightbulb', 'i-mdi-laptop', 'i-mdi-music', 'i-mdi-folder',
]

function close() {
  open.value = false
  showQuickCat.value = false
  catOpen.value = false
  Object.assign(form, defaultForm())
  Object.assign(quickCat, { name: '', icon: 'i-mdi-folder', color: '#6366f1' })
}

watch(open, (v) => {
  if (v) nextTick(() => titleInput.value?.focus())
  // reset default category when opening
  if (v && !form.categoryId) form.categoryId = categoryStore.categories[0]?._id ?? ''
})

async function createQuickCategory() {
  if (!quickCat.name.trim()) return
  creatingCat.value = true
  try {
    const cat = await categoryStore.createCategory({
      name: quickCat.name.trim(),
      icon: quickCat.icon || 'i-mdi-folder',
      color: quickCat.color,
      order: categoryStore.categories.length,
      isDefault: false,
    })
    form.categoryId = cat._id
    showQuickCat.value = false
    Object.assign(quickCat, { name: '', icon: '📁', color: '#6366f1' })
  } finally {
    creatingCat.value = false
  }
}

async function submit() {
  if (!form.title.trim() || !form.categoryId) return
  saving.value = true
  try {
    await todoStore.createTodo({
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      completed: false,
      requirements: [],
      subTasks: [],
      notificationSent: false,
      notifiedAt: null,
    })
    close()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
.modal-enter-active { transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from { opacity: 0; transform: translateY(20px) scale(0.97); }
.modal-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
.slide-down-enter-active { transition: opacity 0.2s ease, max-height 0.25s ease; max-height: 200px; }
.slide-down-leave-active { transition: opacity 0.15s ease, max-height 0.2s ease; max-height: 200px; }
.slide-down-enter-from { opacity: 0; max-height: 0; }
.slide-down-leave-to { opacity: 0; max-height: 0; }
</style>
