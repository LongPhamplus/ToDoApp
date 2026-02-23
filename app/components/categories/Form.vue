<template>
  <div class="space-y-5">
    <!-- Name -->
    <div>
      <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
        Name <span class="text-red-400">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        placeholder="e.g. Work, Health, Study…"
        maxlength="32"
        class="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
      />
    </div>

    <!-- Icon -->
    <div>
      <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Icon</label>
      <div class="grid grid-cols-8 gap-1.5">
        <button
          v-for="ic in quickIcons"
          :key="ic.name"
          type="button"
          @click="form.icon = ic.name"
          :title="ic.label"
          :class="[
            'w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110',
            form.icon === ic.name
              ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-400'
              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700',
          ]"
        >
          <UIcon :name="ic.name" class="w-5 h-5" :style="{ color: form.icon === ic.name ? form.color : undefined }" />
        </button>
      </div>
    </div>

    <!-- Color -->
    <div>
      <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Color</label>
      <div class="flex items-center gap-2 flex-wrap">
        <button v-for="swatch in colorSwatches" :key="swatch" @click="form.color = swatch"
          :title="swatch"
          class="w-7 h-7 rounded-full transition-all hover:scale-110 ring-offset-2 dark:ring-offset-zinc-900"
          :class="form.color === swatch ? 'ring-2 ring-zinc-500' : ''"
          :style="{ backgroundColor: swatch }" />
        <div class="flex items-center gap-2 ml-1">
          <div class="relative w-7 h-7 rounded-full overflow-hidden border border-dashed border-zinc-300 dark:border-zinc-600">
            <div class="w-full h-full" :style="{ backgroundColor: form.color }" />
            <input v-model="form.color" type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </div>
          <input v-model="form.color" type="text" placeholder="#6366f1" maxlength="7"
            class="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400 transition-all" />
        </div>
      </div>
    </div>

    <!-- Live preview -->
    <div class="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
      <span class="w-9 h-9 rounded-xl flex items-center justify-center" :style="{ backgroundColor: form.color + '22', border: `1.5px solid ${form.color}44` }">
        <UIcon :name="form.icon || 'i-mdi-folder'" class="w-5 h-5" :style="{ color: form.color }" />
      </span>
      <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">{{ form.name || 'Category name' }}</span>
      <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: form.color || '#94a3b8' }" />
    </div>

    <!-- Submit -->
    <div class="flex items-center justify-end gap-2 pt-1">
      <button @click="$emit('cancel')" class="px-4 py-2 text-sm rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
        Cancel
      </button>
      <button
        @click="submit"
        :disabled="!form.name.trim() || saving"
        class="px-5 py-2 text-sm font-medium rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 transition-all shadow-sm"
      >
        <span v-if="saving" class="inline-flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          Saving…
        </span>
        <span v-else>{{ editId ? 'Update' : 'Create' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ editId?: string | null }>()
const emit = defineEmits<{ (e: 'done'): void; (e: 'cancel'): void }>()

const categoryStore = useCategoryStore()
const saving = ref(false)

const defaultForm = () => ({ name: '', icon: 'i-mdi-folder', color: '#6366f1' })
const form = reactive(defaultForm())

const quickIcons = [
  { name: 'i-mdi-briefcase',      label: 'Work'       },
  { name: 'i-mdi-account',        label: 'Person'     },
  { name: 'i-mdi-school',         label: 'Study'      },
  { name: 'i-mdi-cart',           label: 'Shopping'   },
  { name: 'i-mdi-home',           label: 'Home'       },
  { name: 'i-mdi-heart',          label: 'Health'     },
  { name: 'i-mdi-star',           label: 'Star'       },
  { name: 'i-mdi-flag',           label: 'Flag'       },
  { name: 'i-mdi-book-open',      label: 'Book'       },
  { name: 'i-mdi-run',            label: 'Fitness'    },
  { name: 'i-mdi-gamepad-variant',label: 'Gaming'     },
  { name: 'i-mdi-airplane',       label: 'Travel'     },
  { name: 'i-mdi-lightbulb',      label: 'Idea'       },
  { name: 'i-mdi-wrench',         label: 'Tools'      },
  { name: 'i-mdi-leaf',           label: 'Nature'     },
  { name: 'i-mdi-palette',        label: 'Art'        },
  { name: 'i-mdi-laptop',         label: 'Tech'       },
  { name: 'i-mdi-music',          label: 'Music'      },
  { name: 'i-mdi-camera',         label: 'Photo'      },
  { name: 'i-mdi-food',           label: 'Food'       },
  { name: 'i-mdi-dumbbell',       label: 'Gym'        },
  { name: 'i-mdi-cash',           label: 'Finance'    },
  { name: 'i-mdi-car',            label: 'Transport'  },
  { name: 'i-mdi-folder',         label: 'Folder'     },
]

const colorSwatches = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4', '#94a3b8']

// Load existing values when editing
watch(() => props.editId, (id) => {
  if (id) {
    const cat = categoryStore.getCategoryById(id)
    if (cat) { form.name = cat.name; form.icon = cat.icon; form.color = cat.color }
  } else {
    Object.assign(form, defaultForm())
  }
}, { immediate: true })

async function submit() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    if (props.editId) {
      await categoryStore.updateCategory(props.editId, { name: form.name.trim(), icon: form.icon || 'i-mdi-folder', color: form.color })
    } else {
      await categoryStore.createCategory({ name: form.name.trim(), icon: form.icon || 'i-mdi-folder', color: form.color, order: categoryStore.categories.length, isDefault: false })
    }
    emit('done')
    Object.assign(form, defaultForm())
  } finally {
    saving.value = false
  }
}
</script>
