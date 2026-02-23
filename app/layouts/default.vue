<template>
  <div class="flex h-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">

    <!-- ─── Desktop Sidebar ────────────────────────────────────────────── -->
    <aside
      :class="[
        'hidden md:flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800',
        'transition-all duration-300 ease-in-out overflow-hidden',
        sidebarOpen ? 'w-56' : 'w-14',
      ]"
    >
      <!-- Logo / Toggle -->
      <div class="flex items-center h-14 px-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="flex items-center gap-2.5 w-full rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 group"
          :title="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
        >
          <!-- App icon -->
          <span class="shrink-0 w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </span>
          <span
            :class="['text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap transition-all duration-200', sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden']"
          >
            Focus
          </span>
        </button>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        <NuxtLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.href"
          custom
          v-slot="{ navigate, isActive }"
        >
          <NavItem
            :item="item"
            :collapsed="!sidebarOpen"
            :active="isActive"
            @click="navigate"
          />
        </NuxtLink>

        <!-- Divider -->
        <div class="my-2 border-t border-zinc-200 dark:border-zinc-800" />

        <!-- Categories section header -->
        <div class="flex items-center justify-between px-2 py-1">
          <span
            :class="['text-[10px] font-semibold uppercase tracking-widest text-zinc-400 whitespace-nowrap transition-all duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0']"
          >
            Categories
          </span>
          <!-- Link to categories page (only when expanded) -->
          <NuxtLink
            v-if="sidebarOpen"
            to="/categories"
            title="Manage categories"
            class="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
          </NuxtLink>
        </div>

        <!-- Dynamic category nav items (filter tasks by category) -->
        <NavItem
          v-for="cat in categoryNavItems"
          :key="cat.id"
          :item="cat"
          :collapsed="!sidebarOpen"
          :active="activeCategoryId === cat.rawId"
          @click="filterByCategory(cat.rawId)"
        />

        <!-- Fallback skeleton while loading -->
        <template v-if="categoryStore.loading && !categoryStore.categories.length">
          <div v-for="i in 3" :key="i"
            class="mx-2 my-0.5 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse"
          />
        </template>
      </nav>

      <!-- Bottom user section -->
      <div class="px-2 py-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-1">
        <!-- Theme toggle -->
        <button
          @click="toggleColorMode"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          class="flex items-center gap-2.5 w-full rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <!-- Sun / Moon icon -->
          <span class="shrink-0 w-7 h-7 flex items-center justify-center">
            <Transition name="theme-icon" mode="out-in">
              <!-- Moon -->
              <svg v-if="isDark" key="moon" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
              <!-- Sun -->
              <svg v-else key="sun" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </Transition>
          </span>
          <span
            :class="['text-sm whitespace-nowrap transition-all duration-200', sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden']"
          >
            {{ isDark ? 'Dark mode' : 'Light mode' }}
          </span>
        </button>

        <!-- User -->
        <div class="flex items-center gap-2.5 w-full rounded-md p-1.5">
          <span class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm uppercase">
            {{ authStore.user?.name?.charAt(0) ?? 'U' }}
          </span>
          <span
            :class="['flex-1 min-w-0 transition-all duration-200', sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden']"
          >
            <p class="text-sm text-zinc-700 dark:text-zinc-300 truncate leading-tight">{{ authStore.user?.name ?? 'User' }}</p>
            <p class="text-[10px] text-zinc-400 truncate">{{ authStore.user?.email ?? '' }}</p>
          </span>
          <!-- Logout button (only visible when expanded) -->
          <button
            v-if="sidebarOpen"
            @click="authStore.logout()"
            title="Sign out"
            class="shrink-0 p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- ─── Main Content ──────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Glassmorphism Top Bar (Mobile header) -->
      <header class="md:hidden sticky top-0 z-20 flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70">
        <span class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </span>
          <span class="text-sm font-semibold tracking-tight">Focus</span>
        </span>
        <div class="flex items-center gap-1">
          <!-- Theme toggle -->
          <button
            @click="toggleColorMode"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            class="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <Transition name="theme-icon" mode="out-in">
              <svg v-if="isDark" key="moon" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
              <svg v-else key="sun" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </Transition>
          </button>
          <!-- Hamburger -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page slot -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- ─── Mobile Bottom Sheet Nav ──────────────────────────────────── -->
    <Transition name="sheet">
      <div
        v-if="mobileMenuOpen"
        class="md:hidden fixed inset-0 z-40 flex flex-col justify-end"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/30 backdrop-blur-sm"
          @click="mobileMenuOpen = false"
        />
        <!-- Sheet -->
        <div class="relative z-10 bg-white dark:bg-zinc-900 rounded-t-2xl border-t border-zinc-200 dark:border-zinc-800 pb-safe shadow-xl">
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-9 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
          <div class="px-4 py-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2 px-2">Navigation</p>
            <nav class="space-y-0.5">
              <!-- Theme toggle row -->
              <button
                @click="toggleColorMode"
                class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Transition name="theme-icon" mode="out-in">
                  <svg v-if="isDark" key="moon" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                  <svg v-else key="sun" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/>
                    <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                </Transition>
                <span>{{ isDark ? 'Dark mode' : 'Light mode' }}</span>
                <!-- Toggle pill -->
                <span class="ml-auto">
                  <span
                    :class="[
                      'inline-flex w-9 h-5 rounded-full p-0.5 transition-all duration-300',
                      isDark ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700',
                    ]"
                  >
                    <span
                      :class="[
                        'w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300',
                        isDark ? 'translate-x-4' : 'translate-x-0',
                      ]"
                    />
                  </span>
                </span>
              </button>
              <div class="border-t border-zinc-100 dark:border-zinc-800 my-1" />
              <NuxtLink
                v-for="item in navItems"
                :key="item.id"
                :to="item.href"
                custom
                v-slot="{ navigate, isActive }"
              >
                <button
                  @click="navigate(); mobileMenuOpen = false"
                  :class="[
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  ]"
                >
                  <span v-html="item.icon" class="w-4 h-4 shrink-0" />
                  <span>{{ item.label }}</span>
                </button>
              </NuxtLink>
              <div v-if="categoryNavItems.length" class="border-t border-zinc-100 dark:border-zinc-800 my-1" />
              <p v-if="categoryNavItems.length" class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 px-3 pt-1 pb-0.5">Categories</p>
              <button
                v-for="cat in categoryNavItems"
                :key="cat.id"
                @click="filterByCategory(cat.rawId); mobileMenuOpen = false"
                :class="[
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  activeCategoryId === cat.rawId
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                ]"
              >
                <span v-html="cat.icon" class="w-4 h-4 shrink-0" />
                <span>{{ cat.label }}</span>
                <span v-if="cat.count" class="ml-auto text-xs text-zinc-400 tabular-nums">{{ cat.count }}</span>
              </button>
            </nav>
          </div>
          <div class="h-6" />
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
const mobileMenuOpen = ref(false)

// ── Stores ────────────────────────────────────────────────────────────────
const categoryStore = useCategoryStore()
const todoStore = useTodoStore()
const authStore = useAuthStore()

onMounted(() => {
  categoryStore.fetchCategories()
  todoStore.fetchTodos()
})

// ── Dark / Light mode ─────────────────────────────────────────────────────
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// ── Nav items (pages) ─────────────────────────────────────────────────────
interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  count?: number
}

const navItems: NavItem[] = [
  {
    id: 'today',
    label: 'Today',
    href: '/today',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`,
  },
  {
    id: 'home',
    label: 'Calendar',
    href: '/home',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/tasks',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
  },
  {
    id: 'summary',
    label: 'Summary',
    href: '/summary',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  },
  {
    id: 'categories',
    label: 'Categories',
    href: '/categories',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`,
  },
]

// ── Category sub-nav ─────────────────────────────────────────────────────
const todoCountByCategory = computed(() => {
  const map: Record<string, number> = {}
  todoStore.todos.forEach(t => {
    if (t.categoryId) map[t.categoryId as string] = (map[t.categoryId as string] ?? 0) + 1
  })
  return map
})

const categoryNavItems = computed(() =>
  categoryStore.categories.map(cat => ({
    id: `cat-${cat._id}`,
    rawId: cat._id as string,
    label: cat.name,
    // small colored rounded square — renders well in NavItem's v-html
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="w-4 h-4"><rect x="2" y="2" width="12" height="12" rx="3" fill="${cat.color}"/></svg>`,
    count: todoCountByCategory.value[cat._id as string],
  })),
)

// active category filter (separate from route)
const activeCategoryId = ref<string | null>(null)

function filterByCategory(catId: string) {
  if (activeCategoryId.value === catId) {
    activeCategoryId.value = null
    todoStore.setFilter({ categoryId: 'all' })
  } else {
    activeCategoryId.value = catId
    todoStore.setFilter({ categoryId: catId })
  }
  // navigate to tasks page
  navigateTo('/tasks')
}
</script>
